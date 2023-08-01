// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

import * as Intro from "./intro";
import * as Gates from "./level_gates";
import * as DataTerminalsPartOne from "./level_data_terminals_part_one";
import * as GateAndTerminal from "./level_gate_and_terminal";
import * as GateAndTerminalPartThree from "./level_gate_and_terminal_part_three";
import * as AsteroidStrike from "./level_asteroid_strike";
import * as PartlyDisabledMovement from "./level_partly_disabled_movement";
import * as ReImplementTurnRight from "./level_reimplement_turn_right";
import * as JournalArrays from "./journal_arrays";
import * as LevelTelepadPartOne from "./level_telepad_part_one";
import * as LoopsPartTwo from "./level_loops_part_two";
import * as GateAndTerminalPartTwo from "./level_gate_and_terminal_part_two";
import * as EnemiesPartOne from "./level_enemies_part_one";
import * as LevelTelepadsAndWhileLoop from "./level_telepads_and_while_loop";

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds =
  | Intro.NodeIds
  | DataTerminalsPartOne.NodeIds
  | Gates.NodeIds
  | GateAndTerminal.NodeIds
  | GateAndTerminalPartThree.NodeIds
  | AsteroidStrike.NodeIds
  | PartlyDisabledMovement.NodeIds
  | ReImplementTurnRight.NodeIds
  | JournalArrays.NodeIds
  | LevelTelepadPartOne.NodeIds
  | LoopsPartTwo.NodeIds
  | GateAndTerminalPartTwo.NodeIds
  | EnemiesPartOne.NodeIds
  | LevelTelepadsAndWhileLoop.NodeIds;
type ChoiceIds =
  | Intro.ChoiceIds
  | DataTerminalsPartOne.ChoiceIds
  | Gates.ChoiceIds
  | GateAndTerminal.ChoiceIds
  | GateAndTerminalPartThree.ChoiceIds
  | AsteroidStrike.ChoiceIds
  | PartlyDisabledMovement.ChoiceIds
  | ReImplementTurnRight.ChoiceIds
  | JournalArrays.ChoiceIds
  | LevelTelepadPartOne.ChoiceIds
  | LoopsPartTwo.ChoiceIds
  | GateAndTerminalPartTwo.ChoiceIds
  | EnemiesPartOne.ChoiceIds
  | LevelTelepadsAndWhileLoop.ChoiceIds;

export interface DialogNode {
  text: string;
  choiceIds: Array<ChoiceIds>;
  nextId?: NodeIds;
}

export interface DialogChoice {
  text: string;
  nextId?: NodeIds;
}

export interface DialogTree {
  name: string;
  startId: NodeIds;
}

// Mostly used for the UI where we need to differentiate different types of messages.
export interface MsgData {
  id: string;
  text: string;
  isPlayer: boolean;
}

export interface DialogTrees {
  [key: string]: DialogTree;
}

export const NODES: { [key in NodeIds]: DialogNode } = {
  ...Intro.NODES,
  ...DataTerminalsPartOne.NODES,
  ...Gates.NODES,
  ...GateAndTerminal.NODES,
  ...GateAndTerminalPartThree.NODES,
  ...AsteroidStrike.NODES,
  ...PartlyDisabledMovement.NODES,
  ...ReImplementTurnRight.NODES,
  ...JournalArrays.NODES,
  ...LevelTelepadPartOne.NODES,
  ...LoopsPartTwo.NODES,
  ...GateAndTerminalPartTwo.NODES,
  ...EnemiesPartOne.NODES,
  ...LevelTelepadsAndWhileLoop.NODES,
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ...Intro.CHOICES,
  ...DataTerminalsPartOne.CHOICES,
  ...Gates.CHOICES,
  ...GateAndTerminal.CHOICES,
  ...GateAndTerminalPartThree.CHOICES,
  ...AsteroidStrike.CHOICES,
  ...PartlyDisabledMovement.CHOICES,
  ...ReImplementTurnRight.CHOICES,
  ...JournalArrays.CHOICES,
  ...LevelTelepadPartOne.CHOICES,
  ...LoopsPartTwo.CHOICES,
  ...GateAndTerminalPartTwo.CHOICES,
  ...EnemiesPartOne.CHOICES,
  ...LevelTelepadsAndWhileLoop.CHOICES,
};

export const TREES: DialogTrees = {
  ...Intro.TREES,
  ...DataTerminalsPartOne.TREES,
  ...Gates.TREES,
  ...GateAndTerminal.TREES,
  ...GateAndTerminalPartThree.TREES,
  ...AsteroidStrike.TREES,
  ...PartlyDisabledMovement.TREES,
  ...ReImplementTurnRight.TREES,
  ...JournalArrays.TREES,
  ...LevelTelepadPartOne.TREES,
  ...LoopsPartTwo.TREES,
  ...GateAndTerminalPartTwo.TREES,
  ...EnemiesPartOne.TREES,
  ...LevelTelepadsAndWhileLoop.TREES,
};
