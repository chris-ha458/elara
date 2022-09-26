pub trait Actor {
    fn apply(&mut self, state: State) -> State;
}

pub struct Simulation {
    state_idx: usize,
    states: Vec<State>,
    actors: Vec<Box<dyn Actor>>,
}

impl Simulation {
    pub fn new() -> Simulation {
        Simulation {
            state_idx: 0,
            states: vec![State::new()],
            actors: vec![],
        }
    }

    pub fn reset(&mut self) {
        self.state_idx = 0;
        self.states = vec![State::new()];
    }

    pub fn curr_state(&self) -> State {
        self.states[self.state_idx].clone()
    }

    pub fn get_history(&self) -> Vec<State> {
        self.states.to_vec()
    }

    pub fn add_actor(&mut self, actor: Box<dyn Actor>) {
        self.actors.push(actor);
    }

    pub fn step_forward(&mut self) {
        // Compute the next state and store it.
        //
        // TODO(albrow): Update this function to have the following steps:
        //
        // 1. Move the player separately from the other actors.
        // 2. Check for win or lose conditions.
        // 3. Move the other actors.
        // 4. Check for win or lose conditions again?
        //
        let mut next_state = self.curr_state().clone();
        for actor in &mut self.actors {
            next_state = actor.apply(next_state);
        }
        self.states.push(next_state);
        self.state_idx += 1;
        log!(
            "finished computing step {}: {:?}",
            self.state_idx,
            next_state
        );
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct State {
    pub player: Player,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Pos {
    pub x: u32,
    pub y: u32,
}

impl State {
    pub fn new() -> State {
        State {
            player: Player {
                pos: Pos::new(0, 0),
            },
        }
    }

    pub fn get_player(&mut self) -> Player {
        self.player.clone()
    }
}

impl Player {
    pub fn get_pos(&mut self) -> Pos {
        self.pos.clone()
    }
}

impl Pos {
    pub fn new(x: u32, y: u32) -> Pos {
        Pos { x, y }
    }

    // Returns i64 for better Rhai compatibility.
    pub fn get_x(&mut self) -> i64 {
        self.x as i64
    }

    // Returns i64 for better Rhai compatibility.
    pub fn get_y(&mut self) -> i64 {
        self.y as i64
    }
}

#[cfg(test)]
mod test {
    // use super::*;

    // #[test]
    // fn test_state() {
    //     let state = State::new();
    //     assert_eq!(state.player.pos.x, 0);
    //     assert_eq!(state.player.pos.y, 0);
    // }

    // #[test]
    // fn test_step_forward() {
    //     struct MoveRight;
    //     impl Actor for MoveRight {
    //         fn apply(&mut self, state: State) -> State {
    //             State {
    //                 player: Player {
    //                     pos: Pos::new(state.player.pos.x + 1, state.player.pos.y),
    //                 },
    //             }
    //         }
    //     }

    //     let mut engine = StateEngine::new();
    //     engine.add_actor(Box::new(MoveRight));
    //     engine.step_forward();

    //     let expected_state = State {
    //         player: Player {
    //             pos: Pos::new(1, 0),
    //         },
    //     };
    //     assert_eq!(engine.curr_state(), &expected_state);
    // }

    // #[test]
    // fn test_step_back() {
    //     struct MoveRight;
    //     impl Actor for MoveRight {
    //         fn apply(&mut self, state: State) -> State {
    //             State {
    //                 player: Player {
    //                     pos: Pos::new(state.player.pos.x + 1, state.player.pos.y),
    //                 },
    //             }
    //         }
    //     }

    //     let mut engine = StateEngine::new();
    //     engine.add_actor(Box::new(MoveRight));

    //     engine.step_forward();
    //     engine.step_back();

    //     let expected_state = State {
    //         player: Player {
    //             pos: Pos::new(0, 0),
    //         },
    //     };
    //     assert_eq!(engine.curr_state(), &expected_state);
    // }
}
