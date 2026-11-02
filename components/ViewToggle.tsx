"use client";
import Link from "next/link";
import Icon from "@/components/Icon";
/** Grid ↔ immersive toggle. Remembers choice so the default (mobile=immersive, desktop=grid) can be overridden. */
export default function ViewToggle({ to, dark }: { to: "grid" | "immersive"; dark?: boolean }) {
  const href = to === "grid" ? "/explore?view=grid" : "/immersive";
  return <Link href={href} onClick={() => { try { localStorage.setItem("kraud.view", to); } catch {} document.cookie = `kview=${to}; path=/; max-age=31536000; samesite=lax`; }} aria-label={to === "grid" ? "Grid view" : "Immersive view"} title={to === "grid" ? "Grid view" : "Immersive view"}
    className={`w-10 h-10 shrink-0 grid place-items-center rounded-full transition active:scale-90 ${dark ? "bg-white/10 backdrop-blur text-white ring-1 ring-white/15" : "bg-white shadow-card text-navy hover:bg-navy hover:text-white"}`}><Icon n={to === "grid" ? "grid" : "play"} className="w-5 h-5" /></Link>;
}
export function FeaturedTag({ dark }: { dark?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full pl-0.5 pr-2.5 py-0.5 text-[11px] font-semibold backdrop-blur ${dark ? "bg-white/15 text-white" : "bg-white/90 text-navy shadow-sm"}`}><span className="w-5 h-5 rounded-full grid place-items-center bg-gradient-to-br from-amber-300 to-amber-500 text-white"><Icon n="star" className="w-3 h-3" /></span>Featured</span>;
}
