"use client";
import { useEffect, useRef } from "react";
import { useSound } from "./sound";
/** <video controls> that follows and updates the global sound preference. */
export default function SoundVideo(p: React.VideoHTMLAttributes<HTMLVideoElement>) {
  const r = useRef<HTMLVideoElement>(null); const [sound, setSound] = useSound();
  useEffect(() => { if (r.current) r.current.muted = !sound; }, [sound]);
  return <video ref={r} {...p} muted={!sound} onVolumeChange={(e) => { const m = e.currentTarget.muted; if (m === sound) setSound(!m); }} />;
}
