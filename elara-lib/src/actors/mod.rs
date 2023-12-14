mod big_enemy_actor;
mod evil_rover_actor;
mod player_actor;

use crate::{
    constants::{HEIGHT, WIDTH},
    simulation::{Pos, State, Telepad},
};

pub use big_enemy_actor::BigEnemyActor;
pub use big_enemy_actor::BIG_ENEMY_SIZE;
pub use evil_rover_actor::EvilRoverActor;
pub use player_actor::PlayerChannelActor;

#[derive(PartialEq, Debug)]
pub enum MoveDirection {
    Forward,
    Backward,
}

#[derive(PartialEq, Debug)]
pub enum TurnDirection {
    Right,
    Left,
}

pub enum Action {
    Wait,
    Move(MoveDirection),
    Turn(TurnDirection),
    Say(String),
    ReadData,
    PressButton,
}

pub struct Bounds {
    pub min_x: i32,
    pub max_x: i32,
    pub min_y: i32,
    pub max_y: i32,
}

impl Bounds {
    pub fn new(min_x: i32, max_x: i32, min_y: i32, max_y: i32) -> Bounds {
        Bounds {
            min_x,
            max_x,
            min_y,
            max_y,
        }
    }

    pub fn default() -> Bounds {
        Bounds {
            min_x: 0,
            max_x: (WIDTH - 1) as i32,
            min_y: 0,
            max_y: (HEIGHT - 1) as i32,
        }
    }
}

fn is_obstacle_at(state: &State, pos: &Pos) -> bool {
    // Data points are treated as simple obstacles since they can never move or be opened.
    state.data_points.iter().any(|o| o.pos == *pos)
        || state.obstacles.iter().any(|o| o.pos == *pos)
        || state.buttons.iter().any(|o| o.pos == *pos) // Buttons can also not be moved.
}

fn is_closed_gate_at(state: &State, pos: &Pos) -> bool {
    state.gates.iter().any(|g| g.pos == *pos && !g.open)
}

fn is_closed_password_gate_at(state: &State, pos: &Pos) -> bool {
    state
        .password_gates
        .iter()
        .any(|g| g.pos == *pos && !g.open)
}

fn get_telepad_at(state: &State, pos: &Pos) -> Option<Telepad> {
    state.telepads.iter().find(|t| t.start_pos == *pos).cloned()
}

fn is_outside_bounds(bounds: &Bounds, pos: &Pos) -> bool {
    pos.x > bounds.max_x || pos.y > bounds.max_y || pos.x < bounds.min_x || pos.y < bounds.min_y
}

/// Returns true if the given position is a valid position for an actor to move to.
/// This applies to player and enemy actors, basically anything that moves around
/// the board.
fn can_move_to(state: &State, bounds: &Bounds, desired_pos: &Pos) -> bool {
    !is_obstacle_at(state, desired_pos)
        && !is_outside_bounds(bounds, desired_pos)
        && !is_closed_gate_at(state, desired_pos)
        && !is_closed_password_gate_at(state, desired_pos)
}

/// Returns the index of any password gates adjacent to the given position.
/// Returns an empty vector if there is no adjacent gate.
fn get_adjacent_password_gates(state: &State, pos: &Pos) -> Vec<usize> {
    let mut gate_indexes = vec![];
    for (i, gate) in state.password_gates.iter().enumerate() {
        if gate.pos.x == pos.x && gate.pos.y == pos.y + 1 {
            gate_indexes.push(i);
        }
        if pos.y != 0 && gate.pos.x == pos.x && gate.pos.y == pos.y - 1 {
            gate_indexes.push(i);
        }
        if gate.pos.x == pos.x + 1 && gate.pos.y == pos.y {
            gate_indexes.push(i);
        }
        if pos.x != 0 && gate.pos.x == pos.x - 1 && gate.pos.y == pos.y {
            gate_indexes.push(i);
        }
    }
    gate_indexes
}
