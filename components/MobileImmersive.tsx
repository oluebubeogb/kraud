"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
/** On phones, /explore defaults to the immersive feed unless ?view=grid. */
export default function MobileImmersive() {
  const r = useRouter();
  useEffect(() => { const q = new URLSearchParams(location.search); if (q.get("view") !== "grid" && !q.get("q") && window.matchMedia("(max-width: 767px)").matches) r.replace("/immersive" + (q.get("city") && q.get("city") !== "All" ? `?city=${encodeURIComponent(q.get("city")!)}` : "")); }, [r]);
  return null;
}
