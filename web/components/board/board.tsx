// import { Pos, State } from "../../lib/state";

import { FuelSpot, Pos, State } from "../../../elara-lib/pkg";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  WIDTH,
  HEIGHT,
} from "../../lib/constants";
import { range } from "../../lib/utils";
import "./board.css";

const PLAYER_Z_INDEX = 200;
const FUEL_Z_INDEX = 100;
const GOAL_Z_INDEX = 100;

interface Offset {
  top: string;
  left: string;
}

function posToOffset(pos: Pos): Offset {
  return {
    left: `${pos.x * (TILE_SIZE + 1) + 1}px`,
    top: `${pos.y * (TILE_SIZE + 1) + 1}px`,
  };
}

interface BoardProps {
  gameState: State;
}

export default function Board(props: BoardProps) {
  const playerOffset = posToOffset(props.gameState.player.pos);
  const goalOffset = posToOffset(props.gameState.goal.pos);

  return (
    <>
      <div id="board">
        <table
          className="table-fixed"
          style={{ width: CANVAS_WIDTH + "px", height: CANVAS_HEIGHT + "px" }}
        >
          <tbody>
            {range(HEIGHT).map((y) => (
              <tr key={y} className="row">
                {range(WIDTH).map((x) => (
                  <td key={x} className="square"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img
        className="player sprite"
        src="/images/robot.png"
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          zIndex: PLAYER_Z_INDEX,
          left: playerOffset.left,
          top: playerOffset.top,
        }}
      />
      <img
        className="flag sprite"
        src="/images/flag.png"
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          zIndex: GOAL_Z_INDEX,
          left: goalOffset.left,
          top: goalOffset.top,
        }}
      />
      {(props.gameState.fuel_spots as FuelSpot[]).map((fuel_spot, i) => {
        const fuelOffset = posToOffset(fuel_spot.pos);
        return (
          <img
            key={i}
            className="fuel sprite"
            src="/images/fuel.png"
            hidden={fuel_spot.collected}
            style={{
              width: TILE_SIZE + "px",
              height: TILE_SIZE + "px",
              zIndex: FUEL_Z_INDEX,
              left: fuelOffset.left,
              top: fuelOffset.top,
            }}
          />
        );
      })}
    </>
  );
}
