use rhai::debugger::DebuggerCommand;
use rhai::{ASTNode, Dynamic, Engine, EvalAltResult, EvalContext, FnCallExpr, Position, Stmt};
use std::cell::RefCell;
use std::convert::TryInto;
use std::io::{Error, ErrorKind};
use std::rc::Rc;
use std::sync::mpsc;

use crate::actors::{Action, Direction};
use crate::constants::ERR_SIMULATION_END;
use crate::levels::Outcome;
use crate::simulation::{Pos, Simulation, State};

/// Responsible for running user scripts and coordinating communication
/// between the Rhai Engine and the Simulation.
pub struct ScriptRunner {
    simulation: Rc<RefCell<Simulation>>,
    /// Used to send actions from the script to the PlayerChannelActor.
    player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
    /// Tracks which lines of code in the user script cause the simulation to
    /// step forward. This is used to highlight active/running lines of code in
    /// the editor UI.
    step_positions: Rc<RefCell<Vec<Position>>>,
}

pub struct ScriptResult {
    pub states: Vec<State>,
    pub positions: Vec<Position>,
    pub outcome: Outcome,
}

impl ScriptRunner {
    pub fn new(
        simulation: Rc<RefCell<Simulation>>,
        player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
    ) -> ScriptRunner {
        ScriptRunner {
            simulation,
            player_action_tx,
            // Start with NONE position for step 0. This ensures that
            // the positions aline with simulation steps.
            step_positions: Rc::new(RefCell::new(vec![Position::NONE])),
        }
    }

    pub fn run(&mut self, script: String) -> Result<ScriptResult, Box<EvalAltResult>> {
        // Create and configure the Rhai engine.
        let mut engine = Engine::new();
        set_engine_safegaurds(&mut engine);
        set_print_fn(&mut engine);
        self.register_debugger(&mut engine);
        register_custom_types(&mut engine);
        self.register_player_funcs(&mut engine);

        // Reset step_positions.
        self.step_positions.borrow_mut().clear();
        self.step_positions.borrow_mut().push(Position::NONE);

        // Make engine non-mutable now that we are done configuring it.
        // This is a saftey measure to prevent scripts from mutating the
        // engine.
        let engine = engine;

        // TODO(albrow): Manually overwrite certain common error messages to make
        // them more user-friendly.
        match engine.run(script.as_str()) {
            Err(err) => {
                match *err {
                    EvalAltResult::ErrorParsing(
                        rhai::ParseErrorType::MissingToken(tok, msg),
                        pos,
                    ) if tok == String::from(";") => {
                        // Special case for missing semicolon. Normally, Rhai
                        // puts this error at the start of the next line, but
                        // that can be confusing. We change the position of the
                        // error so that it is at the previous line.
                        let orig_line = pos.line().unwrap();
                        let modified_line: u16 = (orig_line - 1).try_into().unwrap();
                        return Err(Box::new(EvalAltResult::ErrorParsing(
                            rhai::ParseErrorType::MissingToken(tok, msg),
                            rhai::Position::new(
                                modified_line,
                                pos.position().unwrap().try_into().unwrap(),
                            ),
                        )));
                    }
                    EvalAltResult::ErrorRuntime(_, _)
                        if err.to_string().contains(ERR_SIMULATION_END) =>
                    {
                        // Special case for when the simulation ends before the script
                        // finishes running. This is not actually an error, so we continue.
                    }
                    _ => {
                        // For all other kinds of errors, we return the error.
                        return Err(err);
                    }
                }
            }
            _ => (),
        };

        let states = self.simulation.borrow().get_history();
        let positions = self.step_positions.borrow().to_vec();
        let outcome = self.simulation.borrow().last_outcome();
        Ok(ScriptResult {
            states,
            positions,
            outcome,
        })
    }

    fn register_debugger(&self, engine: &mut Engine) {
        let step_positions = self.step_positions.clone();
        let simulation = self.simulation.clone();
        // Note(albrow): register_debugger is not actually deprecated. The Rhai maintainers
        // have decided to use the "deprecated" attribute to indicate that the API is not
        // stable.
        #[allow(deprecated)]
        engine.register_debugger(
            |_| Dynamic::from(()),
            move |context, _event, node, _source, pos| {
                // println!("{:?}: {:?} at {}", event, node, pos);
                match node {
                    ASTNode::Stmt(Stmt::FnCall(fn_call_expr, ..)) => {
                        match fn_call_expr.name.as_str() {
                            "wait" => {
                                let duration =
                                    eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                                for _ in 0..duration {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_right" => {
                                let spaces =
                                    eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_left" => {
                                let spaces =
                                    eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_up" => {
                                let spaces =
                                    eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_down" => {
                                let spaces =
                                    eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            _ => Ok(DebuggerCommand::StepInto),
                        }
                    }
                    _ => {
                        if simulation.borrow().last_outcome() == Outcome::Continue {
                            Ok(DebuggerCommand::StepInto)
                        } else {
                            Err(ERR_SIMULATION_END.into())
                        }
                    }
                }
            },
        );
    }

    /// Register functions for each action that can exist in a user script.
    /// Each function will simply send the corresponding action(s) through
    /// the channel.
    fn register_player_funcs(&self, engine: &mut Engine) {
        // For each function, we clone and borrow some pointers (e.g. simulation and
        // player_action_tx). This is a workaround due to the fact that the Rhai engine
        // does not allow for mutable non-static references in handlers. See
        // https://rhai.rs/book/patterns/control.html for more context.
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("wait", move |duration: i64| {
            for _ in 0..duration {
                tx.borrow().send(Action::Wait).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_right", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Right)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_left", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Left)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_up", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Up)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_down", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Down)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let simulation = self.simulation.clone();
        engine.register_fn("my_position", move || {
            simulation.borrow().curr_state().player.pos
        });
    }
}

fn set_engine_safegaurds(engine: &mut Engine) {
    // See https://rhai.rs/book/safety/
    engine.set_max_string_size(200);
    engine.set_max_array_size(100);
    engine.set_max_map_size(100);
    engine.set_max_operations(10_000);
    engine.set_max_call_levels(32);
    engine.set_max_expr_depths(64, 32);
    engine.set_strict_variables(true);
}

fn set_print_fn(engine: &mut Engine) {
    engine.on_print(move |s: &str| {
        log!("{}", s);
    });
}

fn register_custom_types(engine: &mut Engine) {
    engine
        .register_type_with_name::<Pos>("Position")
        .register_get("x", Pos::get_x)
        .register_get("y", Pos::get_y);
}

fn eval_call_args_as_int(
    context: EvalContext,
    fn_call_expr: &Box<FnCallExpr>,
) -> Result<i64, Error> {
    if fn_call_expr.args.len() != 1 {
        return Err(Error::new(
            ErrorKind::Other,
            "Expected exactly one argument to function call",
        ));
    }
    let arg = fn_call_expr.args[0].clone();
    let arg_val = match arg.get_literal_value() {
        // Arg is a literal. Much easier to parse.
        Some(dyn_val) => match dyn_val.as_int() {
            Ok(int_val) => int_val,
            Err(actual_type) => {
                return Err(Error::new(
                    ErrorKind::Other,
                    format!("Expected argument to be an integer but got {}", actual_type),
                ))
            }
        },
        _ => {
            // Arg is not a literal, evaluate it using the current context.
            // To do this, we need to first collect all the modules in the current
            // context into a single module. (The main thing we care about for our
            // usecase is user-defined functions inside the script.)
            let mut module = rhai::Module::new();
            for m in context.iter_namespaces() {
                module.combine(m.to_owned());
            }
            // With the module constructed, we can now evaluate the arg expression
            // inside it's own AST tree.
            let arg_ast = rhai::AST::new([rhai::Stmt::Expr(Box::new(arg))], module);
            let mut scope = context.scope().clone();
            let arg_val = context
                .engine()
                .eval_ast_with_scope::<i64>(&mut scope, &arg_ast);
            match arg_val {
                Ok(val) => val,
                Err(err) => {
                    return Err(Error::new(
                        ErrorKind::Other,
                        format!("Error evaluating argument: {}", err),
                    ))
                }
            }
        }
    };
    Ok(arg_val)
}

#[cfg(test)]
mod test {
    // TODO(albrow): Unit test ScriptRunner.
}
