"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Tip from "./Tip";
import Icon from "./Icon";
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
export function Cover({ id, src, alt, className = "" }: { id: string; src: string; alt: string; className?: string }) {
  // Image is always rendered (no state that can lock to placeholder before hydration); on error retry once with cache-buster, then hide.
  const ref = useRef<HTMLImageElement>(null); const [tries, setTries] = useState(0); const [hidden, setHidden] = useState(false);
  const url = tries > 0 && src ? `${src}${src.includes("?") ? "&" : "?"}r=${tries}` : src;
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0 && src) setTries(1); }, [src]);
  useEffect(() => { setHidden(false); setTries(0); }, [src]);
  return (<div className={`relative overflow-hidden bg-gradient-to-br from-navy to-teal ${className}`} style={{ backgroundImage: `url(/media/seed/${id}-cover.svg)`, backgroundSize: "cover" }}>
    {src && !hidden && <img ref={ref} key={url} src={url} alt={alt} decoding="async" onError={() => (tries < 2 ? setTries(tries + 1) : setHidden(true))} className="absolute inset-0 w-full h-full object-cover" />}</div>);
}
