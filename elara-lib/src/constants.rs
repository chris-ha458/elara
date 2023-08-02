use std::collections::HashMap;

/// Width and height of the grid.
pub static WIDTH: u32 = 12;
pub static HEIGHT: u32 = 8;

/// Max amount of energy that the player can have.
pub static MAX_ENERGY: u32 = 50;

/// The amount of energy to add if the player is on a energy cell.
pub static ENERGY_CELL_AMOUNT: u32 = 10;

/// Various common error messages.
pub static ERR_OUT_OF_ENERGY: &str = "G.R.O.V.E.R. ran out of energy!";
pub static ERR_DESTROYED_BY_ENEMY: &str =
    "G.R.O.V.E.R. was attacked and disabled by a malfunctioning rover. Try again!";
/// A special error message that is returned when the simulation ends before
/// the script finishes running. I.e., this is a way for us to abort running
/// a script if the simulation outcome does not require us to continue running
/// it.
pub static ERR_SIMULATION_END: &str = "SIMULATION_END";
/// Returned from read_data if you call it when not adjacent to a data point.
pub static ERR_NO_DATA_POINT: &str = "read_data only works if you are next to a data point.";
/// Returned from press_button if you call it when not adjacent to a button.
pub static ERR_NO_BUTTON: &str = "press_button only works if you are next to a button.";

pub struct BuiltinFunction {
    pub name: &'static str,
    pub arg_types: &'static [&'static str],
}

lazy_static! {
    pub static ref BUILTIN_FUNCTIONS: HashMap<&'static str, BuiltinFunction> = {
        let mut m: HashMap<&'static str, BuiltinFunction> = HashMap::new();

        m.insert(
            "turn_right",
            BuiltinFunction {
                name: "turn_right",
                arg_types: &[],
            },
        );
        m.insert(
            "turn_left",
            BuiltinFunction {
                name: "turn_left",
                arg_types: &[],
            },
        );
        m.insert(
            "move_forward",
            BuiltinFunction {
                name: "move_forward",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_backward",
            BuiltinFunction {
                name: "move_backward",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_down",
            BuiltinFunction {
                name: "move_down",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_up",
            BuiltinFunction {
                name: "move_up",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_left",
            BuiltinFunction {
                name: "move_left",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_right",
            BuiltinFunction {
                name: "move_right",
                arg_types: &["number"],
            },
        );
        m.insert(
            "say",
            BuiltinFunction {
                name: "say",
                arg_types: &["any"],
            },
        );
        m.insert(
            "get_position",
            BuiltinFunction {
                name: "get_position",
                arg_types: &[],
            },
        );
        m.insert(
            "get_orientation",
            BuiltinFunction {
                name: "get_orientation",
                arg_types: &[],
            },
        );
        m.insert(
            "add",
            BuiltinFunction {
                name: "add",
                arg_types: &["number", "number"],
            },
        );
        m.insert(
            "read_data",
            BuiltinFunction {
                name: "read_data",
                arg_types: &[],
            },
        );
        m.insert(
            "wait",
            BuiltinFunction {
                name: "wait",
                arg_types: &["number"],
            },
        );
        m.insert(
            "push",
            BuiltinFunction {
                name: "push",
                arg_types: &["array", "any"],
            },
        );
        m.insert(
            "press_button",
            BuiltinFunction {
                name: "press_button",
                arg_types: &[],
            },
        );

        m
    };
}
