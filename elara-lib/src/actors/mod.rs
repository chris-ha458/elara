mod evil_rover_actor;
mod player_actor;

use crate::simulation::{Pos, State, Telepad};

pub use crate::actors::evil_rover_actor::EvilRoverActor;
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
}

pub struct Bounds {
    pub min_x: i32,
    pub max_x: i32,
    pub min_y: i32,
    pub max_y: i32,
}

fn is_obstacle_at(state: &State, pos: &Pos) -> bool {
    for obstacle in &state.obstacles {
        if obstacle.pos == *pos {
            return true;
        }
    }
    // Data terminals are treated as simple obstacles since
    // they can never move or be opened.
    for data_terminal in &state.data_terminals {
        if data_terminal.pos == *pos {
            return true;
        }
    }
    false
}

fn is_closed_gate_at(state: &State, pos: &Pos) -> bool {
    for gate in &state.password_gates {
        if gate.pos == *pos && !gate.open {
            return true;
        }
    }
    false
}

fn get_telepad_at(state: &State, pos: &Pos) -> Option<Telepad> {
    for telepad in &state.telepads {
        if telepad.start_pos == *pos {
            return Some(telepad.clone());
        }
    }
    None
}

fn is_outside_bounds(bounds: &Bounds, pos: &Pos) -> bool {
    pos.x > bounds.max_x || pos.y > bounds.max_y || pos.x < bounds.min_x || pos.y < bounds.min_y
}

/// Returns the index of any password gates adjacent to the given position.
/// Returns an empty vector if there is no adjacent gate.
fn get_adjacent_gates(state: &State, pos: &Pos) -> Vec<usize> {
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
