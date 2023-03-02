use super::{std_check_win, Level, Outcome, AVAIL_FUNCS_WITH_READ};
use crate::simulation::{
    Actor, DataTerminal, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State,
};

#[derive(Copy, Clone)]
pub struct GateAndTerminalPartTwo {}

impl Level for GateAndTerminalPartTwo {
    fn name(&self) -> &'static str {
        "Slipped My Mind"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_terminal_part_two"
    }
    fn objective(&self) -> &'static str {
        "Get the password from the data terminal ({terminal}), unlock the gate ({gate}), then move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS_WITH_READ
    }
    fn initial_code(&self) -> &'static str {
        r#"// Yet another locked gate! Just like before, the password is
// stored in a data terminal. Can you get through on your own
// this time?
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(11, 1, 10, Orientation::Left);
        state.goal = Some(Goal {
            pos: Pos { x: 9, y: 4 },
        });
        state.obstacles = vec![
            Obstacle::new(8, 0),
            Obstacle::new(8, 1),
            Obstacle::new(8, 2),
            Obstacle::new(9, 0),
            Obstacle::new(10, 2),
            Obstacle::new(11, 0),
            Obstacle::new(11, 2),
        ];
        state.password_gates = vec![PasswordGate::new(9, 2, "hopper".to_string(), false)];
        state.data_terminals = vec![DataTerminal::new(10, 0, "hopper".to_string())];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &GateAndTerminalPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(1);
            let password = read_data();
            move_forward(1);
            say(password);
            turn_left();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
