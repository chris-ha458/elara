use super::{no_objective_check_win, Level, Outcome};
use crate::simulation::{Actor, State};

#[derive(Copy, Clone)]
pub struct MathExpressions {}

impl Level for MathExpressions {
    fn name(&self) -> &'static str {
        "Mathematical!"
    }
    fn objective(&self) -> &'static str {
        "Call the \"say\" function with different math expressions."
    }
    fn initial_code(&self) -> &'static str {
        r#"// A "math expression" uses numbers and a mathematical operator
// (e.g. "+" or "-") to produce a value.
say(2 + 2);
say(5 - 3);
say(2 * 3);
say(6 / 2);

// Math expressions follow the same order of operations you're
// probably used to. For example, multiplication and division
// are done before addition or subtraction.
say(2 + 3 * 4);

// You can also use parenthesis to change the order of operations.
say((2 + 3) * 4);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State::new()]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        no_objective_check_win(state)
    }
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["Math Expressions"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::LEVELS;
    use crate::levels::{level_index_by_name, Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(MathExpressions {}.name());

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
