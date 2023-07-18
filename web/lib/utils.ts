import { LevelData, Pos } from "../../elara-lib/pkg/elara_lib";
import { SaveData } from "../contexts/save_data";
import { Scene } from "../contexts/scenes";
import { TILE_SIZE, AXIS_HEIGHT, AXIS_WIDTH } from "./constants";

// Returns a read-only array of the given size.
export function range(size: number): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i);
}

// Async function which resolves after the given number of milliseconds.
export async function sleep(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface Offset {
  pos?: Pos;
  top: string;
  left: string;
  topNum: number;
  leftNum: number;
}

export function posToOffset(pos: Pos): Offset {
  const leftNum = pos.x * TILE_SIZE + AXIS_WIDTH + 1;
  const topNum = pos.y * TILE_SIZE + AXIS_HEIGHT + 1;
  return {
    pos,
    left: `${leftNum}px`,
    top: `${topNum}px`,
    leftNum,
    topNum,
  };
}

export interface ChallengeProgress {
  completed: number;
  available: number;
}

export function getChallengeProgress(
  levels: Map<string, LevelData>,
  saveData: SaveData
): ChallengeProgress {
  let completed = 0;
  let available = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [levelName, levelState] of Object.entries(saveData.levelStates)) {
    if (levels.get(levelName)?.challenge !== "") {
      available += 1;
      if (levelState.challengeCompleted) {
        completed += 1;
      }
    }
  }

  return {
    completed,
    available,
  };
}

// Returns the next level that appears after the given scene, or
// undefined if scene is the last level.
export function getNextLevel(scene: Scene): Scene | undefined {
  let ptr = scene;
  while (ptr.nextScene !== undefined) {
    if (ptr.nextScene!.type === "level") {
      return ptr.nextScene;
    }
    ptr = ptr.nextScene;
  }
  return undefined;
}

// Returns the next journal page that appears after the given scene, or
// undefined if scene is the last journal page.
export function getNextJournalPage(scene: Scene): Scene | undefined {
  let ptr = scene;
  while (ptr.nextScene !== undefined) {
    if (ptr.nextScene!.type === "journal") {
      return ptr.nextScene;
    }
    ptr = ptr.nextScene;
  }
  return undefined;
}

// Converts a volume from 0 to 1 to an appropriately scaled gain value.
// Human perception of loudness is logarithmic, so this helps to make the
// volume slider "feel" more linear.
export function volumeToGain(volume: number): number {
  return (10 * volume ** 3) / 10;
}
