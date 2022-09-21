// @ts-ignore
import { default as wasmbin } from "../pkg/battle_game_bg.wasm";
import init, { Game, RhaiError, State } from "../pkg/battle_game";
import * as PIXI from "pixi.js";
import * as editorVew from "./editor";
import { setDiagnostics } from "./editor";

(async function () {
  await init(wasmbin);
  const editor = editorVew.init();

  const WIDTH = 12;
  const HEIGHT = 8;
  const TILE_SIZE = 50;
  const CANVAS_WIDTH = (TILE_SIZE + 1) * WIDTH + 1;
  const CANVAS_HEIGHT = (TILE_SIZE + 1) * HEIGHT + 1;
  const GRID_COLOR = 0x000000;
  const BACKGROUND_COLOR = 0xcccccc;
  const GAME_SPEED = 2; // steps per second
  const MS_PER_STEP = 1000 / GAME_SPEED;

  // Create the application helper and add its render target to the page
  const app = new PIXI.Application({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: BACKGROUND_COLOR,
  });
  document.querySelector("#board").appendChild(app.view);

  // Draw grid lines.
  const grid_graphics = new PIXI.Graphics();
  drawGrid(grid_graphics);
  app.stage.addChild(grid_graphics);

  // Create the player sprite and add it to the stage.
  const sprite = PIXI.Sprite.from("/images/cat.png");
  sprite.height = TILE_SIZE;
  sprite.width = TILE_SIZE;
  app.stage.addChild(sprite);

  // Create the game.
  const game = Game.new(WIDTH, HEIGHT);

  // Event listeners.
  let animationTicker: PIXI.Ticker = null;
  document.querySelector("#run-button").addEventListener("click", async () => {
    // Reset game state and ticker.
    game.reset();
    if (animationTicker) {
      animationTicker.stop();
    }
    drawSprites(game.get_state());

    // Remove any error messages from the editor.
    editor.dispatch(setDiagnostics(editor.state, []));

    // Run the simulation.
    const script = editor.state.doc.toString();
    let replay: State[];
    try {
      replay = (await game.run_player_script(script)) as unknown as State[];
    } catch (e) {
      // If there is an error, display it in the editor.
      if (e instanceof RhaiError) {
        console.log(`${e.message}`);

        // In Rhai, positions are composed of (line, column), but
        // CodeMirror wants the absolute position. We need to do
        // some math to convert between the two.
        const line = editor.viewportLineBlocks[e.line - 1];
        // start is the absolute position where the error
        // first occurred, but we still need to get a range.
        let start = line.from + e.col;
        // Use wordAt to get a range encapsulating the "word" that
        // caused the error.
        let range = editor.state.wordAt(start);
        while (range === null) {
          // If wordAt returns null, it means that the error occurred
          // on a non-word character. In this case, we can just
          // decrement the position and try again to find the closest
          // word.
          start -= 1;
          range = editor.state.wordAt(start);
        }

        editor.dispatch(
          setDiagnostics(editor.state, [
            {
              from: range.from,
              to: range.to,
              message: e.message,
              severity: "error",
            },
          ])
        );
        return;
      } else {
        throw e;
      }
    }

    // Step through the simulation at GAME_SPEED.
    let elapsed = 0;
    animationTicker = app.ticker.add(() => {
      elapsed += app.ticker.elapsedMS;
      const target_step = Math.floor(elapsed / MS_PER_STEP);
      if (target_step < replay.length) {
        drawSprites(replay[target_step]);
      }
    });
    animationTicker.start();
  });

  // Helper function to draw the grid lines.
  function drawGrid(graphics: PIXI.Graphics) {
    graphics.beginFill(GRID_COLOR);

    // Vertical lines.
    for (let i = 0; i <= WIDTH; i++) {
      graphics.drawRect(i * (TILE_SIZE + 1), 0, 1, CANVAS_HEIGHT);
    }

    // Horizontal lines.
    for (let i = 0; i <= HEIGHT; i++) {
      graphics.drawRect(0, i * (TILE_SIZE + 1), CANVAS_WIDTH, 1);
    }

    graphics.endFill();
  }

  function drawSprites(state: State) {
    sprite.x = state.player.pos.x * (TILE_SIZE + 1) + 1;
    sprite.y = state.player.pos.y * (TILE_SIZE + 1) + 1;
  }
})();
