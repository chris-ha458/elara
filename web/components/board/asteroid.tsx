import { Box, Image } from "@chakra-ui/react";
import { Animate, AnimateGroup } from "react-simple-animate";

import { useState } from "react";
import {
  ASTEROID_Z_INDEX,
  ROCK_Z_INDEX,
  SPRITE_DROP_SHADOW,
  TILE_SIZE,
} from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
import impactImgUrl from "../../images/board/impact.png";
import { Offset } from "../../lib/utils";

interface AsteroidProps {
  offset: Offset;
}

export default function Asteroid(props: AsteroidProps) {
  const xOffset = Math.random() * 200 - 100;
  const [showImpact, setShowImpact] = useState(false);

  return (
    <>
      <AnimateGroup play>
        <Box
          left={props.offset.left}
          top={props.offset.top}
          position="absolute"
          w={`${TILE_SIZE}px`}
          h={`${TILE_SIZE}px`}
          zIndex={showImpact ? ROCK_Z_INDEX : ASTEROID_Z_INDEX}
        >
          <Animate
            play
            sequenceId={1}
            duration={0.6}
            start={{ transform: `translate(${xOffset}px, -500px) scale(1.5)` }}
            end={{ transform: "translate(0, 0) scale(1.0)" }}
            onComplete={() => {
              setShowImpact(true);
            }}
          >
            <Image
              position="absolute"
              alt="rock"
              // TODO(albrow): Use unique art for asteroids. For now, just re-using the rock art.
              src={rockImgUrl}
              w="48px"
              h="48px"
              zIndex={showImpact ? ROCK_Z_INDEX : ASTEROID_Z_INDEX}
              filter={SPRITE_DROP_SHADOW}
            />
          </Animate>
        </Box>
        <Animate
          play
          sequenceId={2}
          delay={1}
          duration={1.5}
          start={{ opacity: 1.0 }}
          end={{ opacity: 0 }}
        >
          <Image
            left={`${props.offset.leftNum - 8}px`}
            top={`${props.offset.topNum - 8}px`}
            display={showImpact ? "block" : "none"}
            position="absolute"
            alt=""
            w="66px"
            h="66px"
            src={impactImgUrl}
            filter={SPRITE_DROP_SHADOW}
            zIndex={ROCK_Z_INDEX - 1}
          />
        </Animate>
      </AnimateGroup>
      {/* {showImpact && (
        <Box
          left={`${props.offset.leftNum - 7}px`}
          top={`${props.offset.topNum - 7}px`}
          position="absolute"
          w="64px"
          h="64px"
          zIndex={ROCK_Z_INDEX - 1}
        >
          <Animate
            play={showImpact}
            duration={1}
            delay={5}
            start={{ opacity: 1.0 }}
            end={{ opacity: 0 }}
          >
            <Image
              position="absolute"
              alt=""
              // TODO(albrow): Use unique art for asteroids. For now, just re-using the rock art.
              src={impactImgUrl}
              w="64px"
              h="64px"
              filter={SPRITE_DROP_SHADOW}
            />
          </Animate>
        </Box>
      )} */}
    </>
  );
}
