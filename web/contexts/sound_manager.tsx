/* eslint-disable jsx-a11y/media-has-caption */
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouteNode } from "react-router5";

import { Sound } from "../lib/playables/sound";
import { Playable } from "../lib/playables";

import moveSound0 from "../audio/move_0.ogg";
import moveSound1 from "../audio/move_1.ogg";
import moveSound2 from "../audio/move_2.ogg";
import moveSound3 from "../audio/move_3.ogg";
import { RoundRobinPlayable } from "../lib/playables/round_robin";

export const SoundManagerContext = createContext<
  readonly [(name: string) => void, (name: string) => Playable, () => void]
>([
  () => {
    throw new Error("useSound must be used within a SoundManagerContext");
  },
  () => {
    throw new Error("useSound must be used within a SoundManagerContext");
  },
  () => {
    throw new Error("useSound must be used within a SoundManagerContext");
  },
] as const);

export const useSoundManager = () => useContext(SoundManagerContext);
export const useSound = (name: string) => {
  const [_, directGetSound] = useSoundManager();
  return directGetSound(name);
};

export function SoundProvider(props: PropsWithChildren<{}>) {
  const moveRef0 = useRef<HTMLAudioElement>(null);
  const moveRef1 = useRef<HTMLAudioElement>(null);
  const moveRef2 = useRef<HTMLAudioElement>(null);
  const moveRef3 = useRef<HTMLAudioElement>(null);

  // TODO(albrow): Finish fleshing out more sound effects. Probably want more sounds for each
  // action.
  // TODO(albrow): Start working on volume controls. Eventually need to expose this as a setting
  // in the UI.
  const soundDict: Record<string, Playable> = useMemo(
    () => ({
      move: new RoundRobinPlayable("move", [
        new Sound("move_1", moveRef1),
        new Sound("move_2", moveRef2),
        new Sound("move_3", moveRef3),
      ]),
      turn: new Sound("turn", moveRef0),
    }),
    [moveRef0]
  );

  // Unload all sounds when the component unmounts.
  useEffect(() => () => {
    Object.values(soundDict).forEach((sound) => {
      if (sound.isLoaded()) {
        sound.unload();
      }
    });
  });

  // getSound is used when you need more control over the sound (e.g. need
  // to play, pause, stop, or add effects).
  const getSound = useCallback(
    (id: string) => {
      if (!(id in soundDict)) {
        throw new Error(`Sound "${id}" not found`);
      }
      return soundDict[id];
    },
    [soundDict]
  );

  // playSound is used when you just need to play the sound and you don't care
  // about controlling it.
  const playSound = useCallback(
    (id: string) => {
      const sound = getSound(id);
      sound.play();
    },
    [getSound]
  );

  const stopAllSoundEffects = useCallback(() => {
    Object.values(soundDict).forEach((sound) => {
      if (sound.isLoaded()) {
        sound.stop();
      }
    });
  }, [soundDict]);

  // When the route changes, stop all sound effects.
  const { route } = useRouteNode("");
  useEffect(() => {
    stopAllSoundEffects();
  }, [route, stopAllSoundEffects]);

  const providerValue = useMemo(
    () => [playSound, getSound, stopAllSoundEffects] as const,
    [playSound, getSound, stopAllSoundEffects]
  );

  return (
    <SoundManagerContext.Provider value={providerValue}>
      <audio src={moveSound0} ref={moveRef0} />
      <audio src={moveSound1} ref={moveRef1} />
      <audio src={moveSound2} ref={moveRef2} />
      <audio src={moveSound3} ref={moveRef3} />
      {props.children}
    </SoundManagerContext.Provider>
  );
}