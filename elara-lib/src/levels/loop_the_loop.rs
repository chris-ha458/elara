use crate::levels::{Level, Outcome, ERR_OUT_OF_FUEL};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct LoopTheLoop {}

impl Level for LoopTheLoop {
    fn name(&self) -> &'static str {
        "Loop the Loop"
    }
    fn objective(&self) -> &'static str {
        "Move the rover (🤖) to the goal (🏁) using a while loop."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Instead of writing the same code over and over, you can
// use a "while loop" to repeat any code you want. Try using
// a while loop below:

while true {
  move_right(1);
  // Add a line of code here.
  
}
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
            player: Player::new(0, 7, 5),
            fuel_spots: vec![FuelSpot::new(3, 5)],
            goal: Some(Goal {
                pos: Pos::new(8, 0),
            }),
            enemies: vec![],
            obstacles: vec![
                Obstacle::new(0, 6),
                Obstacle::new(0, 5),
                Obstacle::new(1, 5),
                Obstacle::new(1, 4),
                Obstacle::new(2, 4),
                Obstacle::new(2, 3),
                Obstacle::new(3, 3),
                Obstacle::new(3, 2),
                Obstacle::new(4, 2),
                Obstacle::new(4, 1),
                Obstacle::new(5, 1),
                Obstacle::new(5, 0),
                Obstacle::new(6, 0),
                Obstacle::new(2, 7),
                Obstacle::new(3, 7),
                Obstacle::new(3, 6),
                Obstacle::new(4, 6),
                Obstacle::new(4, 5),
                Obstacle::new(5, 5),
                Obstacle::new(5, 4),
                Obstacle::new(6, 4),
                Obstacle::new(6, 3),
                Obstacle::new(7, 3),
                Obstacle::new(7, 2),
                Obstacle::new(8, 2),
                Obstacle::new(8, 1),
                Obstacle::new(9, 1),
                Obstacle::new(9, 0),
            ],
        }]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.pos == state.goal.as_ref().unwrap().pos {
            Outcome::Success
        } else if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else {
            Outcome::Continue
        }
    }
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["While Loop"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::{level_index_by_name, Outcome, LEVELS};

    #[test]
    fn level_three() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(LoopTheLoop {}.name());

        // Running the initial code should result in Outcome::Failure due to
        // running out of fuel.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Running this code should result in Outcome::Success.
        let script = r"loop {
            move_right(1);
            move_up(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}