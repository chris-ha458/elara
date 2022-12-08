use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct LoopsPartTwo {}

impl Level for LoopsPartTwo {
    fn name(&self) -> &'static str {
        "All By Yourself"
    }
    fn objective(&self) -> &'static str {
        "Move the rover (🤖) to the goal (🏁) using a loop."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Try writing a loop on your own this time.

"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
            player: Player::new(0, 0, 10),
            fuel_spots: vec![FuelSpot::new(7, 3)],
            goal: Some(Goal {
                pos: Pos::new(10, 5),
            }),
            enemies: vec![],
            obstacles: vec![
                Obstacle::new(0, 1),
                Obstacle::new(1, 1),
                Obstacle::new(1, 2),
                Obstacle::new(2, 2),
                Obstacle::new(3, 2),
                Obstacle::new(3, 3),
                Obstacle::new(4, 3),
                Obstacle::new(5, 3),
                Obstacle::new(5, 4),
                Obstacle::new(6, 4),
                Obstacle::new(7, 4),
                Obstacle::new(7, 5),
                Obstacle::new(8, 5),
                Obstacle::new(9, 5),
                Obstacle::new(9, 6),
                Obstacle::new(10, 6),
                Obstacle::new(11, 6),
                Obstacle::new(3, 0),
                Obstacle::new(4, 0),
                Obstacle::new(5, 0),
                Obstacle::new(5, 1),
                Obstacle::new(6, 1),
                Obstacle::new(7, 1),
                Obstacle::new(7, 2),
                Obstacle::new(8, 2),
                Obstacle::new(9, 2),
                Obstacle::new(9, 3),
                Obstacle::new(10, 3),
                Obstacle::new(11, 3),
                Obstacle::new(11, 4),
                Obstacle::new(11, 5),
            ],
        }]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["Loops"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::{level_index_by_name, Outcome, LEVELS};

    #[test]
    fn level_three() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(LoopsPartTwo {}.name());

        // Running the initial code should result in Outcome::Continue because
        // the rover does not move at all.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r"loop {
    move_right(2);
    move_down(1);
}";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}