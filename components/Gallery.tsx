"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { SafeImg } from "./Ui";
/** Swipeable photo gallery with dots, arrows, thumbnails and a fullscreen lightbox. */
export default function Gallery({ id, imgs, alt, children }: { id: string; imgs: string[]; alt: string; children?: React.ReactNode }) {
  const [i, setI] = useState(0); const [lb, setLb] = useState(false); const strip = useRef<HTMLDivElement>(null); const lbStrip = useRef<HTMLDivElement>(null);
  const go = (n: number, el = strip.current) => { if (!el) return; const k = Math.max(0, Math.min(imgs.length - 1, n)); el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" }); };
  useEffect(() => { if (!lb) return; const el = lbStrip.current; if (el) el.scrollLeft = i * el.clientWidth; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setLb(false); if (e.key === "ArrowRight") go(i + 1, lbStrip.current); if (e.key === "ArrowLeft") go(i - 1, lbStrip.current); }; addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [lb]); // eslint-disable-line
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); };
  const bg = { backgroundImage: `url(/media/seed/${id}-cover.svg)`, backgroundSize: "cover" };
  return (<>
    <div className="relative h-[52vh] lg:h-[60vh] lg:rounded-3xl overflow-hidden wash-soft" style={bg}>
      <div ref={strip} onScroll={onScroll} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {imgs.map((src, k) => <button key={k} onClick={() => setLb(true)} className="w-full h-full shrink-0 snap-center" aria-label="Open photo"><SafeImg src={src} alt={alt} loading={k ? "lazy" : "eager"} className="w-full h-full" /></button>)}</div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      {imgs.length > 1 && <><div className="absolute top-[max(env(safe-area-inset-top),14px)] right-4 chip bg-black/45 text-white backdrop-blur">{i + 1}/{imgs.length}</div>
        <div className="absolute bottom-28 inset-x-0 flex justify-center gap-1.5 pointer-events-none">{imgs.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />)}</div>
        {i > 0 && <button onClick={() => go(i - 1)} className="hidden md:grid absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 text-navy place-items-center" aria-label="Previous"><Icon n="chevl" /></button>}
        {i < imgs.length - 1 && <button onClick={() => go(i + 1)} className="hidden md:grid absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 text-navy place-items-center" aria-label="Next"><Icon n="chevr" /></button>}</>}
      {children}
    </div>
    {imgs.length > 1 && <div className="hidden lg:flex gap-2 mt-3 overflow-x-auto no-scrollbar">{imgs.map((src, k) => <button key={k} onClick={() => go(k)} className={`w-24 h-16 shrink-0 rounded-xl overflow-hidden ring-2 transition ${k === i ? "ring-teal" : "ring-transparent opacity-70 hover:opacity-100"}`}><SafeImg src={src} className="w-full h-full" /></button>)}</div>}
    {lb && <div className="fixed inset-0 z-[60] bg-black/95 text-white">
      <div ref={lbStrip} onScroll={onScroll} className="h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">{imgs.map((src, k) => <div key={k} className="w-full h-full shrink-0 snap-center grid place-items-center p-2"><SafeImg src={src} alt={alt} fit="object-contain" className="max-w-full max-h-full" /></div>)}</div>
      <button onClick={() => setLb(false)} className="absolute top-[max(env(safe-area-inset-top),14px)] right-4 w-11 h-11 rounded-full bg-white/15 grid place-items-center" aria-label="Close"><Icon n="close" /></button>
      <div className="absolute top-[max(env(safe-area-inset-top),20px)] left-4 text-sm">{i + 1} / {imgs.length}</div>
      {i > 0 && <button onClick={() => go(i - 1, lbStrip.current)} className="hidden md:grid absolute left-4 top-1/2 w-12 h-12 rounded-full bg-white/15 place-items-center" aria-label="Previous"><Icon n="chevl" /></button>}
      {i < imgs.length - 1 && <button onClick={() => go(i + 1, lbStrip.current)} className="hidden md:grid absolute right-4 top-1/2 w-12 h-12 rounded-full bg-white/15 place-items-center" aria-label="Next"><Icon n="chevr" /></button>}
    </div>}
  </>);
}
