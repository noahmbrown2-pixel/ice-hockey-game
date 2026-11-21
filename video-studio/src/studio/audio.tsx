import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// Optional soundtrack props shared by every composition. Paths are under public/.
export type AudioProps = {
  musicSrc?: string; // "" or undefined = no music
  musicVolume?: number;
  voiceoverSrc?: string;
  sfx?: { src: string; frame: number; volume?: number }[];
};

export const StudioAudio: React.FC<AudioProps> = ({ musicSrc, musicVolume = 0.7, voiceoverSrc, sfx = [] }) => (
  <>
    {musicSrc ? <Audio src={staticFile(musicSrc)} volume={musicVolume} /> : null}
    {voiceoverSrc ? <Audio src={staticFile(voiceoverSrc)} /> : null}
    {sfx.map((e, i) => (
      <Sequence key={i} from={e.frame} layout="none">
        <Audio src={staticFile(e.src)} volume={e.volume ?? 1} />
      </Sequence>
    ))}
  </>
);
