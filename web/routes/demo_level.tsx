import { useRouteNode, useRouter } from "react-router5";
import { useState, useEffect, useCallback } from "react";
import { Container, Flex, Box } from "@chakra-ui/react";
import { Unsubscribe } from "router5/dist/types/base";

import {
  FuzzyStateWithLine,
  Game,
  LevelData,
} from "../../elara-lib/pkg/elara_lib";
import Board from "../components/board/board";
import Editor from "../components/editor/editor";
import { LEVELS } from "../lib/scenes";

const game = Game.new();

// A stripped down, smaller level page used for recording GIFs and videos.
export default function DemoLevel() {
  const { route } = useRouteNode("");
  const router = useRouter();
  const levelShortName = route.params.levelId;

  const currLevel = useCallback(() => {
    const level = LEVELS.find((l) => l.level!.short_name === levelShortName);
    if (!level) {
      throw new Error(`cannot find level with short name ${levelShortName}`);
    }
    return level.level!;
  }, [levelShortName]);

  const [boardState, setBoardState] = useState(currLevel().initial_state);

  useEffect(() => {
    document.title = `Elara | Demo Level | ${currLevel().name}`;
  }, [currLevel]);

  const resetLevelState = useCallback(
    (levelOverride?: LevelData) => {
      const levelToLoad = levelOverride || currLevel();
      setBoardState(levelToLoad.initial_state);
    },
    [currLevel]
  );

  // Reset the relevant state when the URL changes.
  useEffect(() => {
    const unsubscribe = router.subscribe((_transition) => {
      resetLevelState(currLevel());
    }) as Unsubscribe;
    return unsubscribe;
  }, [currLevel, resetLevelState, router]);

  // Returns a function that can be used to run a script.
  // Passed through to the editor, which doesn't know about the game object or
  // the current level.
  const runScript = useCallback(
    (script: string) =>
      // Then run the script using the current level name.
      game.run_player_script(script, currLevel().short_name),
    [currLevel]
  );

  const onEditorStep = useCallback((step: FuzzyStateWithLine) => {
    setBoardState(step.state);
  }, []);

  const onScriptCancel = useCallback(() => {
    resetLevelState();
  }, [resetLevelState]);

  return (
    <Container maxW="container.xl" mt={6}>
      <Flex direction="row" mt={4}>
        <Box id="editor-section" mr={2}>
          <Box w="440px">
            <Editor
              type="demo"
              code={currLevel().initial_code}
              originalCode={currLevel().initial_code}
              runScript={runScript}
              onReplayDone={() => {}}
              onScriptError={() => {}}
              onStep={onEditorStep}
              onCancel={onScriptCancel}
              resetOnReplayDone={false}
              availableFunctions={currLevel().available_functions}
            />
          </Box>
        </Box>
        <Box id="board-wrapper" position="relative">
          <Board gameState={boardState} />
        </Box>
      </Flex>
    </Container>
  );
}
