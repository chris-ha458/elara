use rhai::Dynamic;
use std::fmt;

use crate::{
    actors::PlayerChannelActor,
    constants::MAX_FUEL,
    levels::{Level, Outcome, LEVELS},
};

pub trait Actor {
    fn apply(&mut self, state: State) -> State;
}

pub struct Simulation {
    state_idx: usize,
    states: Vec<State>,
    player_actor: PlayerChannelActor,
    level: &'static dyn Level,
    last_outcome: Outcome,
}

impl Simulation {
    pub fn new(player_actor: PlayerChannelActor) -> Simulation {
        let sim = Simulation {
            state_idx: 0,
            states: vec![],
            player_actor: player_actor,
            // Start with the first level by default. Will be overwritten by
            // load_level.
            level: LEVELS.values().next().unwrap().as_ref(),
            last_outcome: Outcome::Continue,
        };
        sim
    }

    /// Loads the given level and creates the initial state using the given
    /// seed. If the level has multiple possible initial states, "seed"
    /// determines which initial state to use.
    ///
    /// Note(albrow): "seed" may also be used as a random number generator
    /// seed to control random behavior in the future.
    pub fn load_level(&mut self, level: &'static dyn Level, seed: usize) {
        self.level = level;
        self.state_idx = 0;
        self.player_actor.set_bounds(level.bounds());
        self.states.clear();
        self.states.push(self.level.initial_states()[seed].clone());
        self.last_outcome = Outcome::Continue;
    }

    pub fn curr_state(&self) -> State {
        self.states[self.state_idx].clone()
    }

    pub fn get_history(&self) -> Vec<State> {
        self.states.to_vec()
    }

    // TODO(albrow): Can we avoid cloning the outcome here and in other places?
    pub fn last_outcome(&self) -> Outcome {
        self.last_outcome.clone()
    }

    pub fn step_forward(&mut self) -> Outcome {
        // If the current outcome is not Continue, then we can't take any more
        // steps forward. This happens if the player has already won or lost.
        if self.last_outcome != Outcome::Continue && self.last_outcome != Outcome::NoObjective {
            return self.last_outcome.clone();
        }

        // Otherwise, compute the next state and store it.
        let mut next_state = self.curr_state().clone();
        // 1. Apply the player actor first, separately from the other actors.
        next_state = self.player_actor.apply(next_state);
        // 2. Check for win or lose conditions.
        let outcome = self.level.check_win(&next_state);
        match outcome {
            Outcome::Success => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Success;
                return outcome;
            }
            Outcome::Failure(msg) => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure(msg.clone());
                return self.last_outcome.clone();
            }
            Outcome::Continue => {}
            Outcome::NoObjective => {
                self.last_outcome = Outcome::NoObjective;
            }
        }
        // 3. Apply the other actors.
        for actor in &mut self.level.actors() {
            next_state = actor.apply(next_state);
        }
        // 4. Check for win or lose conditions again.
        let outcome = self.level.check_win(&next_state);
        match outcome {
            Outcome::Success => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Success;
                return outcome;
            }
            Outcome::Failure(msg) => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure(msg.clone());
                return self.last_outcome.clone();
            }
            Outcome::Continue => {}
            Outcome::NoObjective => {
                self.last_outcome = Outcome::NoObjective;
            }
        }

        // log!(
        //     "finished computing step {}: {:?}",
        //     self.state_idx,
        //     next_state
        // );
        self.states.push(next_state);
        self.state_idx += 1;
        self.last_outcome.clone()
    }
}

#[derive(Clone, PartialEq)]
pub struct State {
    pub player: Player,
    pub fuel_spots: Vec<FuelSpot>,
    pub goal: Option<Goal>,
    pub enemies: Vec<Enemy>,
    pub obstacles: Vec<Obstacle>,
    pub password_gates: Vec<PasswordGate>,
    pub data_terminals: Vec<DataTerminal>,
}

impl State {
    pub fn new() -> State {
        State {
            player: Player::new(0, 0, MAX_FUEL, Orientation::Right),
            fuel_spots: vec![],
            goal: None,
            enemies: vec![],
            obstacles: vec![],
            password_gates: vec![],
            data_terminals: vec![],
        }
    }
}

impl fmt::Debug for State {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("State")
            .field("player", &self.player)
            .field("fuel_spots", &self.fuel_spots)
            .field("goal", &self.goal)
            .field("enemies", &self.enemies)
            .field("password_gates", &self.password_gates)
            .field("password_terminals", &self.data_terminals)
            // Omitting obstacles field since it can be very long and
            // the obstacles never move.
            // .field("obstacles", &self.obstacles)
            .finish()
    }
}

#[derive(Clone, PartialEq, Debug)]
pub enum Orientation {
    Up,
    Down,
    Left,
    Right,
}

/// The animation state of the player sprite. This is used in
/// in the UI to give more clarity to the player about what is
/// happening.
#[derive(Clone, PartialEq, Debug)]
pub enum PlayerAnimState {
    Idle,
    Moving,
    Turning,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
    pub fuel: u32,
    pub message: String,
    pub anim_state: PlayerAnimState,
    pub facing: Orientation,
    pub total_fuel_used: u32,
}

impl Player {
    pub fn new(x: u32, y: u32, fuel: u32, facing: Orientation) -> Player {
        Player {
            pos: Pos::new(x as i32, y as i32),
            fuel: fuel,
            message: String::new(),
            anim_state: PlayerAnimState::Idle,
            facing: facing,
            total_fuel_used: 0,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct FuelSpot {
    pub pos: Pos,
    pub collected: bool,
}

impl FuelSpot {
    pub fn new(x: u32, y: u32) -> FuelSpot {
        FuelSpot {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            collected: false,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Goal {
    pub pos: Pos,
}

/// The animation state of the enemy sprite.
#[derive(Clone, PartialEq, Debug)]
pub enum EnemyAnimState {
    Idle,
    Moving,
    // TODO(albrow): Add more states for attacking, etc.
}

#[derive(Clone, PartialEq, Debug)]
pub struct Enemy {
    pub pos: Pos,
    pub anim_state: EnemyAnimState,
}

impl Enemy {
    pub fn new(x: u32, y: u32) -> Enemy {
        Enemy {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            anim_state: EnemyAnimState::Idle,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Obstacle {
    pub pos: Pos,
}

impl Obstacle {
    pub fn new(x: u32, y: u32) -> Obstacle {
        Obstacle {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct PasswordGate {
    pub pos: Pos,
    pub open: bool,
    pub password: String,
}

impl PasswordGate {
    pub fn new(x: u32, y: u32, password: String, open: bool) -> PasswordGate {
        PasswordGate {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            open,
            password,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub enum TermData {
    String(String),
    Array(Vec<TermData>),
}

impl From<String> for TermData {
    fn from(s: String) -> TermData {
        TermData::String(s)
    }
}

impl From<&str> for TermData {
    fn from(s: &str) -> TermData {
        TermData::String(s.to_string())
    }
}

impl From<Vec<TermData>> for TermData {
    fn from(v: Vec<TermData>) -> TermData {
        TermData::Array(v)
    }
}

impl From<TermData> for Dynamic {
    fn from(data: TermData) -> Dynamic {
        match data {
            TermData::String(s) => s.into(),
            TermData::Array(v) => Dynamic::from_array(v.into_iter().map(|x| x.into()).collect()),
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct DataTerminal {
    pub pos: Pos,
    pub data: TermData,
    pub reading: bool,
}

impl DataTerminal {
    pub fn new(x: u32, y: u32, data: TermData) -> DataTerminal {
        DataTerminal {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            data,
            reading: false,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Pos {
    pub x: i32,
    pub y: i32,
}

impl Pos {
    pub fn new(x: i32, y: i32) -> Pos {
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

/// Returns the index of the data terminal adjacent to the given
/// position. Returns None if there is no adjacent data terminal.
pub fn get_adjacent_terminal(state: &State, pos: &Pos) -> Option<usize> {
    for (i, terminal) in state.data_terminals.iter().enumerate() {
        if terminal.pos.x == pos.x && terminal.pos.y == pos.y + 1 {
            return Some(i);
        }
        if pos.y != 0 && terminal.pos.x == pos.x && terminal.pos.y == pos.y - 1 {
            return Some(i);
        }
        if terminal.pos.x == pos.x + 1 && terminal.pos.y == pos.y {
            return Some(i);
        }
        if pos.x != 0 && terminal.pos.x == pos.x - 1 && terminal.pos.y == pos.y {
            return Some(i);
        }
    }
    None
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
