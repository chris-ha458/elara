// Shared constants go here. Other constants should be
// defined in their respective components.
export const PROD_HOSTNAME = "play.elaragame.com";

// Screen size.
export const MIN_BG_WIDTH = "980px";

// Constants related to the game board and game logic.
export const WIDTH = 12;
export const HEIGHT = 8;
export const TILE_SIZE = 50;
export const AXIS_HEIGHT = 18; // Width of the axis labels at left of the game board.
export const AXIS_WIDTH = 18; // Width of the axis labels at top of the game board.
export const BOARD_INNER_WIDTH = TILE_SIZE * WIDTH;
export const BOARD_INNER_HEIGHT = TILE_SIZE * HEIGHT;
export const BOARD_TOTAL_WIDTH = BOARD_INNER_WIDTH + AXIS_WIDTH + 2;
export const BOARD_TOTAL_HEIGHT = BOARD_INNER_HEIGHT + AXIS_HEIGHT + 2;
export const DEFAULT_FUEL_GAIN = 10;

// Game speed and animations.
export const DEFAULT_GAME_SPEED = 1; // steps per second
export const CSS_ANIM_DURATION = (1 / DEFAULT_GAME_SPEED) * 0.75; // seconds

// Constants related to the game's UI.
export const FUNCTION_LIST_WIDTH = 160;
export const NAVBAR_HEIGHT = 56; // In pixels
export const NAVBAR_DROPDOWN_ITEMS_PER_COLUMN = 12;

// Z-indexes are all defined here so we can make sure
// elements are in the correct order.
//
// **IMPORTANT**: If you change these, search for related CSS properties.
// Some CSS properties need to be manually kept in sync with these values.
// In such a case, there should be a comment above the CSS property explaining it.
//
export const NAVBAR_Z_INDEX = 2000;
export const CHAKRA_TOOL_TIP_Z_INDEX = 1500; // Used for Chakra tooltips (not including rover messages).
export const LEVEL_SELECT_MODAL_Z_INDEX = 1200;
export const HINTS_MODAL_Z_INDEX = 1200;
export const LEVEL_END_MODAL_Z_INDEX = 1200;
export const JOURNAL_MODAL_Z_INDEX = 1200;
export const TUTORIAL_MODAL_Z_INDEX = 1200;
export const DIALOG_MODAL_Z_INDEX = 1150;
export const CM_TOOL_TIP_Z_INDEX = 800; // Used for Codemirror tooltips (e.g. hover docs).
export const AXIS_LABEL_Z_INDEX = 700;
export const BOARD_HOVER_INFO_Z_INDEX = 600;
export const PLAYER_MESSAGE_Z_INDEX = 400;
export const ENEMY_Z_INDEX = 300;
export const ROVER_SPEECH_Z_INDEX = 210; // Special tooltip variant used only for rover messages.
export const PLAYER_Z_INDEX = 200;
export const FUEL_Z_INDEX = 100;
export const GOAL_Z_INDEX = 100;
export const TELEPAD_Z_INDEX = 100;
export const WALL_Z_INDEX = 100;
export const BUTTON_Z_INDEX = 100;
export const GATE_Z_INDEX = 100;
export const TERMINAL_Z_INDEX = 100;
export const BUTTON_WIRE_INDEX = 50;
export const BG_INDEX = -100;

// Various messages that are displayed to the user.
export const CODE_LEN_EXPLANATION =
  "The number of characters in your code not including comments, spaces, newlines, or tabs.";
