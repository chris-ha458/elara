import { useState, useEffect, useCallback } from "react";
import { Container, Flex, Text, Box } from "@chakra-ui/react";

import {
  MdCheckCircle,
  MdCheckCircleOutline,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
import {
  FuzzyStateWithLines,
  Game,
  RunResult,
  ScriptStats,
} from "../../elara-lib/pkg";
import Board from "../components/board/board";
import Editor, { EditorState } from "../components/editor/editor";
import ObjectiveText from "../components/level/objective_text";
import {
  markLevelChallengeCompleted,
  markLevelCompleted,
  updateLevelCode,
  useSaveData,
} from "../contexts/save_data";
import DialogModal from "../components/dialog/dialog_modal";
import ShowDialogButton from "../components/level/show_dialog_button";
import { TREES } from "../lib/dialog_trees";
import { useShortsModal } from "../contexts/shorts_modal";
import LevelEndModal from "../components/level/level_end_modal";
import { getLevelEndProps } from "../lib/level_end_messages";
import { useCurrScene } from "../contexts/scenes";
import ChallengeText from "../components/level/challenge_text";

const game = Game.new();

export default function Level() {
  const [saveData, setSaveData] = useSaveData();
  const currScene = useCurrScene();
  const [editorState, setEditorState] = useState<EditorState>("editing");

  const currLevel = useCallback(() => {
    if (!currScene || currScene.type !== "level" || !currScene.level) {
      throw new Error(`Could not get level for current scene: ${currScene}`);
    }
    return currScene.level!;
  }, [currScene]);

  // Update the page title whenever the level changes.
  useEffect(() => {
    if (!currScene) {
      return;
    }
    document.title = `Elara | Level ${currScene.levelIndex}: ${
      currLevel().name
    }`;
  }, [currLevel, currScene]);

  const initialCode = useCallback(
    () =>
      saveData.levelStates[currLevel().short_name]?.code ||
      currLevel().initial_code,
    [currLevel, saveData.levelStates]
  );

  const [boardState, setBoardState] = useState(currLevel().initial_state);
  useEffect(() => {
    // Set the boardState whenever the level changes.
    setBoardState(currLevel().initial_state);
  }, [currLevel]);

  const [showShortsModal, _] = useShortsModal();
  useEffect(() => {
    // Update the shorts modal state whenever the route changes.
    if (currScene?.tutorialShorts) {
      // Note this may be overriden by the ShortsModalContext if the user
      // has already seen these particular tutorials.
      showShortsModal(currScene.tutorialShorts);
    }
  }, [currScene?.tutorialShorts, showShortsModal]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalKind, setModalKind] = useState<"success" | "failure">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalStats, setModalStats] = useState<ScriptStats | undefined>();

  const getDialogTree = useCallback(() => {
    const dialogTreeName = `level_${currLevel().short_name}`;
    if (!(dialogTreeName in TREES)) {
      // There is no dialog tree for this level.
      return null;
    }
    return dialogTreeName;
  }, [currLevel]);

  const shouldShowDialogTree = useCallback(() => {
    const dialogTreeName = `level_${currLevel().short_name}`;
    return (
      getDialogTree() !== null &&
      !saveData.seenDialogTrees.includes(dialogTreeName)
    );
  }, [currLevel, getDialogTree, saveData.seenDialogTrees]);

  const [dialogVisible, setDialogVisible] = useState(shouldShowDialogTree());
  useEffect(() => {
    // Update the dialog state whenever the level changes.
    setDialogVisible(shouldShowDialogTree());
  }, [shouldShowDialogTree]);

  const resetLevelState = useCallback(() => {
    setModalVisible(false);
    setBoardState(currLevel().initial_state);
  }, [currLevel]);

  // Returns a function that can be used to run a script.
  // Passed through to the editor, which doesn't know about the game object or
  // the current level.
  const runScript = useCallback(
    (script: string) => {
      // Store the latest code in the save data.
      const newSaveData = updateLevelCode(
        saveData,
        currLevel().short_name,
        script
      );
      setSaveData(newSaveData);

      // Then run the script using the current level name.
      return game.run_player_script(script, currLevel().short_name);
    },
    [currLevel, saveData, setSaveData]
  );

  const onEditorStep = useCallback((step: FuzzyStateWithLines) => {
    setBoardState(step.state);
  }, []);

  const onEditorStateChange = useCallback((state: EditorState) => {
    setEditorState(state);
  }, []);

  // Called when the replay is done (i.e. the user has either completed or failed the
  // objective).
  const onReplayDone = useCallback(
    (script: string, result: RunResult) => {
      const endResult = getLevelEndProps(result, currLevel().challenge);

      // Show the modal.
      setModalKind(endResult.modalKind);
      setModalTitle(endResult.modalTitle);
      setModalMessage(endResult.modalMessage);
      setModalStats(result.stats);
      setModalVisible(true);

      // Store the latest code in the save data.
      // We need to do this again to prevent race conditions.
      let pendingSaveData = updateLevelCode(
        saveData,
        currLevel().short_name,
        script
      );
      if (endResult.isCompleted) {
        // Update the level completed status.
        pendingSaveData = markLevelCompleted(
          pendingSaveData,
          currLevel().short_name
        );
      }
      if (result.passes_challenge) {
        // Update the level completed status.
        pendingSaveData = markLevelChallengeCompleted(
          pendingSaveData,
          currLevel().short_name
        );
      }
      setSaveData(pendingSaveData);
    },
    [currLevel, saveData, setSaveData]
  );

  const persistCode = useCallback(
    (script: string) => {
      const pendingSaveData = updateLevelCode(
        saveData,
        currLevel().short_name,
        script
      );
      setSaveData(pendingSaveData);
    },
    [currLevel, saveData, setSaveData]
  );

  const onScriptError = useCallback((script: string, error: Error) => {
    setModalKind("failure");
    setModalTitle("Uh Oh!");
    setModalMessage(error.message);
    setModalVisible(true);
  }, []);

  const onScriptCancel = useCallback(() => {
    resetLevelState();
  }, [resetLevelState]);

  const getObjectiveIcon = useCallback(() => {
    if (currScene !== null && currScene.completed) {
      return (
        <MdCheckCircle
          size="1.1em"
          color="var(--chakra-colors-green-400)"
          style={{
            marginRight: "0.2rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    return (
      <MdCheckCircleOutline
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [currScene]);

  const getChallengeIcon = useCallback(() => {
    if (currScene !== null && currScene.challengeCompleted) {
      return (
        <MdStar
          size="1.1em"
          color="var(--chakra-colors-yellow-400)"
          style={{
            marginRight: "0.2rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    return (
      <MdStarBorder
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [currScene]);

  return (
    <>
      <LevelEndModal
        visible={modalVisible}
        setVisible={setModalVisible}
        title={modalTitle}
        message={modalMessage}
        kind={modalKind}
        stats={modalStats}
        onClose={resetLevelState}
      />
      <DialogModal
        visible={dialogVisible}
        setVisible={setDialogVisible}
        treeName={getDialogTree()}
      />
      <Container maxW="container.xl" mt={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={1}>
            Level {currScene?.levelIndex}: {currLevel().name}
          </Text>
          <Text as="span" verticalAlign="middle">
            {getObjectiveIcon()}
            <Text as="span" verticalAlign="middle" fontWeight="bold">
              Objective:
            </Text>{" "}
            <ObjectiveText text={currLevel().objective} />
          </Text>
          {currLevel().challenge !== "" && currScene?.completed && (
            <Text as="span" ml="0.5em" verticalAlign="middle">
              {getChallengeIcon()}
              <Text as="span" verticalAlign="middle" fontWeight="bold">
                Challenge:
              </Text>{" "}
              <ChallengeText text={currLevel().challenge} />
            </Text>
          )}
        </Box>
        <Flex direction="row" mt={4}>
          <Box id="editor-section" mr={2} flexGrow={1}>
            <Box w="608px">
              <Editor
                type="level"
                code={initialCode()}
                originalCode={currLevel().initial_code}
                availableFunctions={currLevel().available_functions}
                runScript={runScript}
                onReplayDone={onReplayDone}
                onScriptError={onScriptError}
                onStep={onEditorStep}
                onCancel={onScriptCancel}
                persistCode={persistCode}
                onStateChange={onEditorStateChange}
              />
            </Box>
          </Box>
          <Box id="board-wrapper" position="relative">
            <Board
              gameState={boardState}
              // Note: We only want to enable animations if the editor is in the "running" state.
              // If the editor is in the "paused" state, it's more clear to move the sprites in
              // discrete steps.
              enableAnimations={editorState === "running"}
            />
          </Box>
        </Flex>
        {!dialogVisible && getDialogTree() !== null && (
          <Box mt="60px">
            <ShowDialogButton onClick={() => setDialogVisible(true)} />
          </Box>
        )}
      </Container>
    </>
  );
}
