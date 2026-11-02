"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
const HINTS = ["Lekki duplex", "Carcass in Abuja", "6-bed Maitama", "Co-own under ₦5M", "Short-term yield", "Ikoyi terrace", "Off-plan Enugu"];
/** Search input with an animated rotating placeholder so it reads clearly as search. */
export default function SearchBar({ action = "/explore", q = "", dark, hidden = {} }: { action?: string; q?: string; dark?: boolean; hidden?: Record<string, string> }) {
  const [i, setI] = useState(0); const [v, setV] = useState(q); const [focus, setFocus] = useState(false);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % HINTS.length), 2400); return () => clearInterval(t); }, []);
  return (<form action={action} className={`relative flex-1 min-w-0 ${dark ? "h-10" : "h-12"}`}>
    {Object.entries(hidden).map(([k, x]) => <input key={k} type="hidden" name={k} value={x} />)}
    <Icon n="search" className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none z-10 ${dark ? "text-white/80" : "text-silver"}`} />
    <input name="q" value={v} onChange={(e) => setV(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} aria-label="Search properties" autoComplete="off"
      className={`w-full h-full rounded-full pl-10 pr-4 text-[14px] outline-none transition ${dark ? "bg-white/10 backdrop-blur ring-1 ring-white/15 text-white focus:bg-white/15" : "bg-white shadow-card ring-1 ring-silver-200 focus:ring-teal/40 text-navy"}`} />
    {!v && !focus && <span className={`pointer-events-none absolute left-10 right-4 top-1/2 -translate-y-1/2 text-[14px] truncate ${dark ? "text-white/65" : "text-silver"}`}>Search <span key={i} className="inline-block k-hint">{HINTS[i]}</span></span>}
  </form>);
}
