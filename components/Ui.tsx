"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Tip from "./Tip";
import Icon from "./Icon";
import { useSound, playPref } from "./sound";
export function PasswordInput({ name = "password", placeholder = "At least 8 characters", label = "Password", help = true }: { name?: string; placeholder?: string; label?: string; help?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="label inline-flex items-center gap-1.5">{label}{help && <Tip text="At least 8 characters, with a number or symbol. We email a Nigerian-word code for verification and resets." />}</span>
      <div className="relative mt-1.5">
        <input name={name} type={show ? "text" : "password"} autoComplete="off" autoCapitalize="none" placeholder={placeholder} className="input pr-12" required />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide" : "Show"} className="absolute right-1 top-1 h-10 w-10 grid place-items-center text-silver hover:text-navy"><Icon n={show ? "eyeoff" : "eye"} /></button>
      </div>
    </label>
  );
}
export async function post(action: string, body: unknown) {
  const r = await fetch("/api/" + action, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error || "Something went wrong"); return d;
}
export function ActionButton({ action, body, children, className = "btn-primary", then, confirm: c }: { action: string; body?: unknown; children: React.ReactNode; className?: string; then?: string; confirm?: string }) {
  const r = useRouter(); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  return (<span className="inline-flex flex-col"><button disabled={busy} className={className} onClick={async () => { if (c && !window.confirm(c)) return; setBusy(true); setMsg(""); try { const d = await post(action, body ?? {}); if (then) r.push(then.replace(":id", d.id ?? "").replace(":ref", d.ref ?? "")); else { if (d.added !== undefined) setMsg(`Added ${d.added} listings · ${d.files} files on volume`); if (d.removedListings !== undefined) setMsg(`Removed ${d.removedListings} listings · ${d.removedFiles} files deleted`); r.refresh(); } } catch (e: any) { setMsg(e.message); } setBusy(false); }}>{busy ? "Please wait…" : children}</button>{msg && <span className="text-xs mt-1 text-teal">{msg}</span>}</span>);
}
export function SafeImg({ src, alt = "", className = "", fit = "object-cover", onLoad, onError, ...rest }: { src?: string; alt?: string; className?: string; fit?: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "className">) {
  // Hidden until loaded; one retry (cache-buster + no-referrer); then removed. Never shows the browser broken-icon.
  const ref = useRef<HTMLImageElement>(null); const [st, setSt] = useState<{ s?: string; t: number; ok: boolean; dead: boolean }>({ s: src, t: 0, ok: false, dead: false });
  const cur = st.s === src ? st : { s: src, t: 0, ok: false, dead: false };
  if (cur !== st) setSt(cur);
  const ext = !!src && /^https?:/.test(src);
  const url = cur.t > 0 && src ? `${src}${src.includes("?") ? "&" : "?"}r=1` : src;
  const fail = (e?: React.SyntheticEvent<HTMLImageElement>) => { setSt((x) => (x.s !== src ? x : x.t < 1 ? { ...x, t: 1 } : { ...x, dead: true })); onError?.(e as any); };
  useEffect(() => { const i = ref.current; if (!i || !i.complete) return; if (i.naturalWidth > 0) setSt((x) => (x.s === src ? { ...x, ok: true } : x)); else fail(); }, [url]); // eslint-disable-line
  if (!src || cur.dead) return null;
  return <img ref={ref} key={url} src={url} alt={cur.ok ? alt : ""} decoding="async" referrerPolicy={ext ? "no-referrer" : undefined} onLoad={(e) => { setSt((x) => (x.s === src ? { ...x, ok: true } : x)); onLoad?.(e); }} onError={fail} className={`${fit} transition-opacity duration-300 ${cur.ok ? "opacity-100" : "opacity-0"} ${className}`} {...rest} />;
}
export function Cover({ id, src, alt, className = "", video }: { id: string; src: string; alt: string; className?: string; video?: string }) {
  const v = useRef<HTMLVideoElement>(null); const [bad, setBad] = useState(false); const [on, setOn] = useState(false); const [sound, setSound] = useSound();
  useEffect(() => { const el = v.current; if (!el || !video) return; const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting && e.intersectionRatio > 0.7), { threshold: [0, 0.7] }); io.observe(el); return () => io.disconnect(); }, [video]);
  useEffect(() => { const el = v.current; if (!el) return; if (on) playPref(el, sound); else el.pause(); }, [on, sound]);
  return (<div className={`relative overflow-hidden wash-soft ${className}`} style={{ backgroundImage: `url(/media/seed/${id}-cover.svg)`, backgroundSize: "cover" }}>
    <SafeImg src={src} alt={alt} className="absolute inset-0 w-full h-full" />
    {video && !bad && <video ref={v} src={video} poster={src} muted loop playsInline preload="metadata" onError={() => setBad(true)} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} />}
    {video && !bad && <span className="absolute left-2 bottom-2 z-[1] rounded-full bg-[#002454]/70 text-white text-[10px] font-semibold px-2 py-0.5 backdrop-blur">▶ Video</span>}
    {video && !bad && on && <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSound(!sound); }} className="absolute right-2 bottom-2 z-[2] rounded-full bg-[#002454]/70 text-white text-[11px] font-semibold px-2 py-1 backdrop-blur ring-1 ring-white/20" aria-label={sound ? "Mute" : "Unmute"}>{sound ? "🔊" : "🔇 Tap for sound"}</button>}</div>);
}
