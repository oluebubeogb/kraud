"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Icon from "./Icon";
import { Avatar, ModeChip, DealSheet } from "./Deal";
import { FeaturedTag } from "./ViewToggle";
import type { Deal } from "@/lib/deal";
export type More = { id: string; title: string; seller: string; sellerId: string; sellerImg: string | null; deal: Deal; featured?: boolean; tags: string[] };
/** "See more…" control → sleek bottom overlay with the rest of the deal; blurs content behind. */
export default function SeeMore({ m, dark }: { m: More; dark?: boolean }) {
  const [open, setOpen] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open]);
  const btn = <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} className={`text-[13px] font-semibold underline-offset-2 hover:underline ${dark ? "text-white/90" : "text-teal"}`}>See more…</button>;
  if (!open || !ready) return btn;
  return (<>{btn}{createPortal(<div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-[#001a3d]/25 backdrop-blur-[6px] animate-[kfade_.2s_ease]" onClick={() => setOpen(false)}>
    <div role="dialog" aria-label={m.title} onClick={(e) => e.stopPropagation()} className="k-pop w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-xl text-[#0B1B33] p-5 pb-[max(env(safe-area-inset-bottom),20px)] shadow-lift space-y-3.5">
      <div className="mx-auto sm:hidden h-1 w-10 rounded-full bg-silver-200 -mt-1 mb-1" />
      {m.featured && <FeaturedTag />}
      <div className="flex items-center gap-3"><Avatar src={m.sellerImg} name={m.seller} size={44} /><div className="min-w-0 flex-1"><Link href={`/u/${m.sellerId}`} className="block font-semibold text-navy truncate hover:underline">{m.seller}</Link><div className="text-[12px] text-silver truncate">{m.title}</div></div><ModeChip d={m.deal} /></div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] font-medium text-navy/70">{m.tags.map((t) => <span key={t}>#{t}</span>)}</div>
      <DealSheet d={m.deal} compact />
      <div className="flex gap-2 pt-1"><Link href={`/property/${m.id}`} className="btn-primary flex-1">View details</Link><button type="button" onClick={() => setOpen(false)} className="btn-ghost w-11 px-0" aria-label="Close"><Icon n="close" /></button></div>
    </div></div>, document.body)}</>);
}
