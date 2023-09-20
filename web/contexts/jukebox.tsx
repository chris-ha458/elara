import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSaveData } from "../hooks/save_data_hooks";
import { Playable } from "../lib/playables";
import { Sound } from "../lib/playables/sound";
import { volumeToGain } from "../lib/utils";
import { MUSIC_FADE_OUT_TIME_MS } from "../lib/constants";

import prelude from "../audio/music/prelude.ogg";
import preludeFallback from "../audio/music/prelude.mp3";
import gettingOffTheGround from "../audio/music/getting_off_the_ground.ogg";
import gettingOffTheGroundFallback from "../audio/music/getting_off_the_ground.mp3";
import driftingIntoSpace from "../audio/music/drifting_into_space.ogg";
import driftingIntoSpaceFallback from "../audio/music/drifting_into_space.mp3";
import lookingAhead from "../audio/music/looking_ahead.ogg";
import lookingAheadFallback from "../audio/music/looking_ahead.mp3";
import measuringTheChallenge from "../audio/music/measuring_the_challenge.ogg";
import measuringTheChallengeFallback from "../audio/music/measuring_the_challenge.mp3";
import puttingItAllTogether from "../audio/music/putting_it_all_together.ogg";
import puttingItAllTogetherFallback from "../audio/music/putting_it_all_together.mp3";
import notTheEnd from "../audio/music/not_the_end.ogg";
import notTheEndFallback from "../audio/music/not_the_end.mp3";

// How much to lower the music volume temporarily when ducking is enabled.
const DUCK_LEVEL = 0.5;

interface Jukebox {
  requestSong: (id: string) => void;
  stopSong: (id: string) => void;
  stopAllMusic: (fadeOut?: number) => void;
  duckMusic: () => void;
  unduckMusic: () => void;
}

export const JukeboxContext = createContext<Jukebox>({
  requestSong: () => {
    throw new Error("JukeboxContext not initialized");
  },
  stopSong: () => {
    throw new Error("JukeboxContext not initialized");
  },
  stopAllMusic: () => {
    throw new Error("JukeboxContext not initialized");
  },
  duckMusic: () => {
    throw new Error("JukeboxContext not initialized");
  },
  unduckMusic: () => {
    throw new Error("JukeboxContext not initialized");
  },
});

export function JukeboxProvider(props: PropsWithChildren<{}>) {
  const [saveData] = useSaveData();
  const [masterGain] = useState(saveData.settings.masterVolume);
  const [relMusicGain, setRelMusicGain] = useState(
    saveData.settings.musicVolume
  );
  // tempMusicGain is used for ducking (i.e. temporary volume reduction)
  const [tempMusicGain, setTempMusicGain] = useState(1.0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  // timeout used to transition between songs
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);

  const musicGain = useMemo(
    () => volumeToGain(masterGain * relMusicGain * tempMusicGain),
    [masterGain, relMusicGain, tempMusicGain]
  );
  useEffect(() => {
    setRelMusicGain(saveData.settings.musicVolume);
  }, [saveData.settings.musicVolume]);

  const musicDict: Record<string, Playable> = useMemo(
    () => ({
      prelude: new Sound("prelude", "music", [prelude, preludeFallback], {
        loop: true,
        fadeIn: 4000,
        stream: true,
      }),
      gettingOffTheGround: new Sound(
        "gettingOffTheGround",
        "music",
        [gettingOffTheGround, gettingOffTheGroundFallback],
        {
          loop: true,
          fadeIn: 10,
          stream: true,
        }
      ),
      driftingIntoSpace: new Sound(
        "driftingIntoSpace",
        "music",
        [driftingIntoSpace, driftingIntoSpaceFallback],
        {
          loop: true,
          fadeIn: 10,
          stream: true,
        }
      ),
      lookingAhead: new Sound(
        "lookingAhead",
        "music",
        [lookingAhead, lookingAheadFallback],
        {
          loop: true,
          fadeIn: 10,
          stream: true,
        }
      ),
      measuringTheChallenge: new Sound(
        "measuringTheChallenge",
        "music",
        [measuringTheChallenge, measuringTheChallengeFallback],
        {
          loop: true,
          fadeIn: 10,
          stream: true,
        }
      ),
      puttingItAllTogether: new Sound(
        "puttingItAllTogether",
        "music",
        [puttingItAllTogether, puttingItAllTogetherFallback],
        {
          loop: true,
          fadeIn: 10,
          stream: true,
        }
      ),
      notTheEnd: new Sound(
        "notTheEnd",
        "music",
        [notTheEnd, notTheEndFallback],
        {
          loop: true,
          fadeIn: 10,
          stream: true,
        }
      ),
    }),
    []
  );

  useEffect(() => {
    Object.values(musicDict)
      .filter((sound) => sound.category === "music")
      .forEach((sound) => {
        sound.setCatGain(musicGain);
      });
  }, [musicGain, musicDict]);

  const stopAllMusic = useCallback(
    (fadeOut?: number) => {
      Object.values(musicDict)
        .filter((sound) => sound.category === "music")
        .forEach((sound) => {
          if (sound.isPlaying()) {
            sound.stop(fadeOut);
          }
        });
      setCurrentlyPlaying(null);
    },
    [musicDict]
  );

  const requestSong = useCallback(
    (id: string) => {
      if (musicDict[id] == null) {
        throw new Error(`No song with id ${id}`);
      }
      if (currentlyPlaying === id) {
        return;
      }
      const song = musicDict[id];
      if (currentlyPlaying !== null) {
        stopAllMusic(MUSIC_FADE_OUT_TIME_MS);
        if (transitionTimeout.current) {
          clearTimeout(transitionTimeout.current);
        }
        transitionTimeout.current = setTimeout(() => {
          song.play();
        }, MUSIC_FADE_OUT_TIME_MS);
      } else {
        song.play();
      }
      setCurrentlyPlaying(id);
    },
    [currentlyPlaying, musicDict, stopAllMusic]
  );

  const stopSong = useCallback(
    (id: string) => {
      if (id in musicDict) {
        const song = musicDict[id];
        song.stop();
        setCurrentlyPlaying(null);
      } else {
        throw new Error(`No song with id ${id}`);
      }
    },
    [musicDict]
  );

  const duckMusic = useCallback(() => {
    setTempMusicGain(DUCK_LEVEL);
  }, []);

  const unduckMusic = useCallback(() => {
    setTempMusicGain(1.0);
  }, []);

  const providerValue = useMemo(
    () => ({
      requestSong,
      stopSong,
      stopAllMusic,
      duckMusic,
      unduckMusic,
    }),
    [requestSong, stopSong, duckMusic, stopAllMusic, unduckMusic]
  );

  return (
    <JukeboxContext.Provider value={providerValue}>
      {props.children}
    </JukeboxContext.Provider>
  );
}
