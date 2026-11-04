"use client";
import { useEffect, useState } from "react";
/** Global, sticky video sound preference (persisted in localStorage, synced across components/tabs). Default muted. */
const K = "kraud:sound"; const EV = "kraud-sound";
export const getSound = () => { try { return typeof window !== "undefined" && localStorage.getItem(K) === "on"; } catch { return false; } };
export const setSound = (on: boolean) => { try { localStorage.setItem(K, on ? "on" : "off"); } catch {} if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EV, { detail: on })); };
export function useSound(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(getSound()); const f = () => setOn(getSound()); window.addEventListener(EV, f); window.addEventListener("storage", f); return () => { window.removeEventListener(EV, f); window.removeEventListener("storage", f); }; }, []);
  return [on, setSound];
}
/** Play with sound if allowed; fall back to muted if the browser blocks it (pref stays). */
export function playPref(el: HTMLVideoElement, sound: boolean) { el.muted = !sound; el.play().catch(() => { el.muted = true; el.play().catch(() => {}); }); }
