// Shared constants go here. Other constants should be
// defined in their respective components.
export const PROD_HOSTNAME = "play.elaragame.com";

// Screen size.
export const MIN_BG_WIDTH = "980px";

// How long to wait when navigating to a new scene before playing the sound.
export const SOUND_DELAY_TIME_MS = 100;
// How long it takes to fade out one song before playing the next.
export const MUSIC_FADE_OUT_TIME_MS = 1000;

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
export const DEFAULT_ENERGY_CELL_GAIN = 10;
export const SPRITE_DROP_SHADOW = "drop-shadow(0px 3px 1px rgba(0, 0, 0, 0.3))";

// Game speed and animations.
export const DEFAULT_GAME_SPEED = 1; // steps per second
export const DEFAULT_STEP_TIME = 1000 / DEFAULT_GAME_SPEED; // milliseconds
export const CSS_ANIM_DURATION = (1 / DEFAULT_GAME_SPEED) * 0.75; // seconds

// Constants related to the game's UI.
export const FUNCTION_LIST_WIDTH = 160;
export const NAVBAR_HEIGHT = 56; // In pixels
export const NAVBAR_DROPDOWN_ITEMS_PER_COLUMN = 12;

// Breakpoints for responsive design. In pixels.
// WARNING: If you change this, you also need to update board.css and editor.css.
export const BP_SM = 480;
export const BP_MD = 768;
export const BP_LG = 992;
export const BP_XL = 1268;
export const BP_2XL = 1500;

// Z-indexes are all defined here so we can make sure
// elements are in the correct order.
//
// **IMPORTANT**: If you change these, search for related CSS properties.
// Some CSS properties need to be manually kept in sync with these values.
// In such a case, there should be a comment above the CSS property explaining it.

// Start with background images and frames.
export const BG_Z_INDEX = -1000;
export const MONITOR_STAND_Z_INDEX = -950;
export const MONITOR_FRAME_Z_INDEX = -900;

// Next section is for the board/map and the elements that appear on top of it.
export const BOARD_BG_Z_INDEX = -100;
export const BUTTON_WIRE_Z_INDEX = 10;
export const ASTEROID_WARNING_Z_INDEX = 20;
export const ROCK_Z_INDEX = 20;
export const DATA_POINT_Z_INDEX = 30;
export const UNLOCKED_GATE_Z_INDEX = 40;
export const BUTTON_Z_INDEX = 50;
export const TELEPAD_Z_INDEX = 60;
export const GOAL_Z_INDEX = 70;
export const ENERGY_CELL_Z_INDEX = 80;
export const PLAYER_Z_INDEX = 110;
export const ENEMY_Z_INDEX = 120;
export const LOCKED_GATE_Z_INDEX = 130;
export const SERVER_Z_INDEX = 140;
export const ASTEROID_Z_INDEX = 150;

export const ROVER_MESSAGE_Z_INDEX = 1010; // Special tooltip variant used only for rover messages.
export const BOARD_HOVER_INFO_Z_INDEX = 1020;
export const AXIS_LABEL_Z_INDEX = 1030;
export const CM_TOOL_TIP_Z_INDEX = 1040; // Used for Codemirror tooltips (e.g. hover docs).
export const CHAKRA_MODAL_Z_INDEX = 1050; // Used for Chakra modals.
export const CHAKRA_TOOL_TIP_Z_INDEX = 1060; // Used for Chakra tooltips (not including rover messages).
export const NAVBAR_Z_INDEX = 2000;

// Various messages that are displayed to the user.
export const CODE_LEN_EXPLANATION =
  "The number of characters in your code not including comments, spaces, newlines, or tabs.";
