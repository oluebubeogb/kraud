"use client";
import { useState } from "react";
import Icon from "./Icon";
/** Compact tooltip: hover/focus on desktop, tap to toggle on touch. Replaces wordy helper notes. */
export default function Tip({ text, children, className = "" }: { text: string; children?: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (<span className={`k-tip-wrap relative inline-flex items-center ${className}`} data-open={open ? "1" : "0"} onMouseLeave={() => setOpen(false)}>
    {children ?? <button type="button" aria-label={text} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }} className="w-4 h-4 inline-grid place-items-center text-silver hover:text-teal transition-colors duration-200"><Icon n="info" className="w-4 h-4" /></button>}
    <span role="tooltip" className="k-tip rounded-xl bg-navy text-white text-[11.5px] font-medium leading-snug px-3 py-2 shadow-lift">{text}</span></span>);
}
