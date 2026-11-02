"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
/** On phones, /explore defaults to the immersive feed unless the user chose grid (toggle / ?view=grid) or is searching. */
export default function MobileImmersive() {
  const r = useRouter();
  useEffect(() => { const q = new URLSearchParams(location.search); let pref = ""; try { pref = localStorage.getItem("kraud.view") || ""; } catch {}
    if (q.get("view") === "grid" || q.get("q") || pref === "grid") return;
    if (window.matchMedia("(max-width: 767px)").matches) r.replace("/immersive" + (q.get("city") && q.get("city") !== "All" ? `?city=${encodeURIComponent(q.get("city")!)}` : "")); }, [r]);
  return null;
}
