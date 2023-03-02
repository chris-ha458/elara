import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";
import { ShortId } from "./tutorial_shorts";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

// A special level used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;

export type SceneType = "level" | "dialog" | "journal";

export interface Scene {
  type: SceneType;
  name: string;
  route: string;
  level?: LevelData;
  tutorialShorts?: ShortId[];
}

function sceneFromLevelName(shortName: string): Scene {
  const level = levelData.get(shortName);
  if (!level) {
    throw new Error(`No level with short name ${shortName}`);
  }
  return {
    type: "level",
    name: `Level: ${level.name}`,
    route: `/level/${shortName}`,
    level,
  };
}

export const SCENES: Scene[] = [
  {
    type: "dialog",
    name: "Introduction",
    route: "/dialog/intro",
  },
  {
    ...sceneFromLevelName("movement"),
    tutorialShorts: [
      "how_to_run_code",
      "how_to_pause_and_step",
      "where_to_find_objectives",
      "how_to_see_errors",
    ],
  },
  {
    type: "journal",
    name: "Functions",
    route: "/journal/concepts/functions",
  },
  {
    type: "journal",
    name: "Comments",
    route: "/journal/concepts/comments",
  },
  {
    ...sceneFromLevelName("movement_part_two"),
    tutorialShorts: ["how_to_navigate_scenes"],
  },
  {
    ...sceneFromLevelName("fuel_part_one"),
    tutorialShorts: ["moving_takes_fuel", "how_to_get_more_fuel"],
  },
  {
    type: "journal",
    name: "Strings",
    route: "/journal/concepts/strings",
  },
  {
    type: "journal",
    name: "Loops",
    route: "/journal/concepts/loops",
  },
  sceneFromLevelName("loops_part_one"),
  sceneFromLevelName("loops_part_two"),
  sceneFromLevelName("gates"),
  {
    type: "journal",
    name: "Variables",
    route: "/journal/concepts/variables",
  },
  {
    type: "journal",
    name: "Function Outputs",
    route: "/journal/concepts/function_outputs",
  },
  // sceneFromLevelName("data_terminal_demo"),
  {
    ...sceneFromLevelName("gate_and_terminal"),
    tutorialShorts: ["how_to_use_data_terminals"],
  },
  {
    ...sceneFromLevelName("gate_and_terminal_part_two"),
  },
  // Temporarily disabled for the sake of saving time during playtesting.
  // {
  //   ...sceneFromLevelName("gate_and_terminal_part_three"),
  // },
  {
    type: "journal",
    name: "Comparisons",
    route: "/journal/concepts/comparisons",
  },
  {
    type: "journal",
    name: "If Statements",
    route: "/journal/concepts/if_statements",
  },
  sceneFromLevelName("seismic_activity"),
  sceneFromLevelName("partly_disabled_movement"),
];

export const LEVELS = SCENES.filter((s) => s.type === "level");
export const JOURNAL_PAGES = SCENES.filter((s) => s.type === "journal");

export const getSceneIndexFromRoute = (route: string): number | undefined =>
  SCENES.findIndex((scene) => scene.route === route);

export const getLevelIndexFromScene = (scene: Scene): number | undefined =>
  LEVELS.indexOf(scene);

export const getSceneFromRoute = (route: string): Scene | undefined =>
  SCENES.find((scene) => scene.route === route);

export const getNextSceneFromRoute = (route: string): Scene | undefined => {
  const index = getSceneIndexFromRoute(route);
  if (index === undefined) {
    return undefined;
  }
  if (index === SCENES.length - 1) {
    return undefined;
  }
  return SCENES[index + 1];
};
