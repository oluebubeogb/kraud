"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSound } from "@/components/sound";
import ViewToggle from "@/components/ViewToggle";
import Icon from "@/components/Icon";
import { post, SafeImg } from "@/components/Ui";
import { naira, nairaShort } from "@/lib/format";
import SeeMore from "@/components/SeeMore";
import SearchBar from "@/components/SearchBar";
import type { Deal } from "@/lib/deal";
import { STATUS_LABEL } from "@/lib/listings";
export type FeedItem = { id: string; title: string; price: number; city: string; state: string; estate: string; desc: string; beds: number; baths: number; sqm: number; kind: string; attrs: unknown; videos: string[]; status: string; type: string; seller: string; sellerId: string; imgs: string[]; featured: boolean; deal: Deal; sellerImg: string | null };

function Act({ icon, label, on, onClick, href }: { icon: string; label: string; on?: boolean; onClick?: () => void; href?: string }) {
  const inner = <><span className={`w-12 h-12 rounded-full grid place-items-center backdrop-blur-md ring-1 transition duration-200 active:scale-90 ${on ? "bg-[#1F7A72] ring-[#1F7A72] text-white" : "bg-[#002454]/45 ring-white/15 text-white"}`}><Icon n={icon} className="w-6 h-6" /></span><span className="text-[11px] font-semibold text-white/90 drop-shadow">{label}</span></>;
  return href ? <Link href={href} className="flex flex-col items-center gap-1" aria-label={label}>{inner}</Link> : <button onClick={onClick} className="flex flex-col items-center gap-1" aria-label={label}>{inner}</button>;
}

function Vid({ src, poster, active, muted, onToggle, onFail }: { src: string; poster?: string; active: boolean; muted: boolean; onToggle: () => void; onFail: () => void }) {
  const v = useRef<HTMLVideoElement>(null); const [vis, setVis] = useState(false); const [paused, setPaused] = useState(false);
  useEffect(() => { const el = v.current; if (!el) return; const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting && e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] }); io.observe(el); return () => io.disconnect(); }, []);
  useEffect(() => { const el = v.current; if (!el) return; if (vis && active && !paused) { el.muted = muted; el.play().catch(() => { el.muted = true; el.play().catch(() => {}); }); } else el.pause(); }, [vis, active, muted, paused]);
  return (<div className="absolute inset-0 flex items-center justify-center">
    <video ref={v} src={src} poster={poster} muted={muted} loop playsInline preload={active ? "auto" : "metadata"} onError={onFail} onClick={() => setPaused((p) => !p)} className="w-full h-full object-contain md:max-w-[min(1100px,86%)] md:max-h-[78%] md:rounded-3xl bg-black/30 animate-[kfade_.5s_ease]" />
    {paused && <button onClick={() => setPaused(false)} className="absolute z-10 w-16 h-16 rounded-full bg-black/45 backdrop-blur grid place-items-center text-white text-2xl" aria-label="Play">▶</button>}
    <button onClick={onToggle} className="absolute z-10 top-[calc(max(env(safe-area-inset-top),12px)+76px)] left-4 md:left-10 h-9 px-3 rounded-full bg-[#002454]/60 backdrop-blur ring-1 ring-white/20 text-white text-xs font-semibold" aria-label={muted ? "Unmute" : "Mute"}>{muted ? "🔇 Tap for sound" : "🔊 Sound on"}</button>
  </div>);
}

function Slide({ it, authed, me, saved, onSave }: { it: FeedItem; authed: boolean; me: string | null; saved: boolean; onSave: () => void }) {
  const r = useRouter(); const [i, setI] = useState(0); const [toast, setToast] = useState(""); const strip = useRef<HTMLDivElement>(null);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1800); };
  const chat = async () => { if (!authed) return r.push("/signup"); if (me === it.sellerId) return flash("This is your listing"); try { const d = await post("chat-start", { listingId: it.id }); r.push(`/chat/${d.id}`); } catch (e: any) { flash(e.message); } };
  const save = async () => { if (!authed) return r.push("/signup"); if (saved) return r.push("/savings"); try { await post("goal", { listingId: it.id, units: it.deal.canInvest ? 1 : 0 }); onSave(); flash("Saving toward it — see Savings"); } catch (e: any) { flash(e.message); } };
  const d = it.deal; const primary = d.canInvest ? { label: "Invest", icon: "coins", href: `/checkout/${it.id}?mode=invest` } : d.canBuy ? { label: "Buy", icon: "key", href: `/checkout/${it.id}?mode=buy` } : null;
  const [bad, setBad] = useState<string[]>([]); const [sound, setSound] = useSound(); const muted = !sound;
  const media: { t: "v" | "i"; src: string }[] = [...(it.videos || []).filter((v) => !bad.includes(v)).map((src) => ({ t: "v" as const, src })), ...it.imgs.map((src) => ({ t: "i" as const, src }))];
  const bg = media[i]?.t === "i" ? media[i].src : it.imgs[0];
  const [orient, setOrient] = useState<Record<number, "p" | "l">>({}); const portrait = orient[i] === "p";
  const go = (d: number) => { const el = strip.current; if (el) el.scrollTo({ left: (i + d) * el.clientWidth, behavior: "smooth" }); };
  return (<section className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-[#001a3d]">
    <div className={`absolute inset-0 scale-110 blur-2xl transition-opacity duration-500 ${portrait ? "opacity-0 md:opacity-60" : "opacity-60"}`} style={{ backgroundImage: bg ? `url(${bg})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
    <div ref={strip} onScroll={(e) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); }} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
      {media.map((m, k) => { const src = m.src; const p = orient[k] === "p"; return <div key={m.t + src} className="relative w-full h-full shrink-0 snap-center flex items-center justify-center">
        {m.t === "v" ? <Vid src={src} poster={it.imgs[0]} active={k === i} muted={muted} onToggle={() => setSound(muted)} onFail={() => setBad((b) => [...b, src])} /> :
        <SafeImg src={src} alt={it.title} loading={k ? "lazy" : "eager"} draggable={false} fit={p ? "object-cover" : "object-contain"} onLoad={(e) => { const im = e.currentTarget; setOrient((o) => ({ ...o, [k]: im.naturalHeight > im.naturalWidth * 1.05 ? "p" : "l" })); }}
          className={p ? "absolute inset-0 w-full h-full md:static md:h-full md:w-auto md:max-w-full md:aspect-[9/16] md:shadow-2xl animate-[kfade_.5s_ease]" : "w-full md:w-auto max-h-[62%] md:max-h-[78%] md:max-w-[min(1100px,86%)] md:rounded-3xl shadow-2xl ring-1 ring-white/10 animate-[kfade_.5s_ease]"} />}
      </div>; })}
    </div>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#002454]/55 via-transparent via-40% to-[#001a3d]/95" />
    {media.length > 1 && <><div className="absolute z-10 top-[calc(max(env(safe-area-inset-top),12px)+60px)] inset-x-0 flex justify-center gap-1.5 pointer-events-none">{media.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/45"}`} />)}</div>
      {i > 0 && <button onClick={() => go(-1)} className="hidden md:grid absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/15 backdrop-blur place-items-center hover:bg-white/25" aria-label="Previous photo"><Icon n="chevl" /></button>}
      {i < media.length - 1 && <button onClick={() => go(1)} className="hidden md:grid absolute right-24 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/15 backdrop-blur place-items-center hover:bg-white/25" aria-label="Next photo"><Icon n="chevr" /></button>}</>}
    <div className="absolute right-3 md:right-8 bottom-[calc(env(safe-area-inset-bottom)+28px)] flex flex-col gap-4 z-10">
      {primary && <Act icon={primary.icon} label={primary.label} on href={authed ? primary.href : "/signup"} />}
      <Act icon="bookmark" label={saved ? "Saved" : "Save"} on={saved} onClick={save} />
      <Act icon="chat" label="Chat" onClick={chat} />
      <Act icon="expand" label="Details" href={`/property/${it.id}`} />
    </div>
    <div className="absolute left-4 md:left-10 right-20 md:right-auto md:max-w-xl bottom-[calc(env(safe-area-inset-bottom)+24px)] text-white z-10 drop-shadow-[0_1px_8px_rgba(0,0,0,.5)]">
      <h2 className="text-[17px] md:text-xl font-bold tracking-tight leading-snug">{it.title}</h2>
      <div className="mt-0.5 text-[15px] font-semibold text-[#9FD8D2]">{d.mode !== "BUY" && d.seats ? <>{nairaShort(d.unit)}<span className="text-white/75 font-medium"> / unit · whole {nairaShort(it.price)}</span></> : naira(it.price)}</div>
      <div className="mt-0.5 flex items-center gap-1 text-[13px] text-white/85"><Icon n="pin" className="w-4 h-4 shrink-0" /><span className="truncate">{it.estate}, {it.city}</span><span className="shrink-0 ml-1"><SeeMore dark m={{ id: it.id, title: it.title, seller: it.seller, sellerId: it.sellerId, sellerImg: it.sellerImg, deal: d, featured: it.featured, tags: [it.type, STATUS_LABEL[it.status] || it.status, `${it.beds}bd ${it.baths}ba ${it.sqm}m²`] }} /></span></div>
    </div>
    {toast && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full bg-[#002454]/90 text-white text-sm px-4 py-2">{toast}</div>}
  </section>);
}

export default function Feed({ items, authed, me, savedIds, q = "" }: { items: FeedItem[]; authed: boolean; me: string | null; savedIds: string[]; q?: string }) {
  const r = useRouter(); const [saved, setSaved] = useState<string[]>(savedIds);
  return (<div className="fixed inset-0 bg-[#001a3d] text-white">
    <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-1 px-3 pt-[max(env(safe-area-inset-top),12px)] pb-2 pointer-events-none">
      <button onClick={() => (history.length > 1 ? r.back() : r.push("/explore"))} className="pointer-events-auto w-10 h-10 shrink-0 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 grid place-items-center" aria-label="Back"><Icon n="back" /></button>
      <div className="pointer-events-auto flex-1 min-w-0 mx-2 md:max-w-md"><SearchBar dark action="/immersive" q={q} /></div>
      <div className="pointer-events-auto flex items-center gap-2">{!authed && <Link href="/login" className="hidden sm:inline-flex h-10 items-center rounded-full bg-white text-[#002454] px-4 text-sm font-semibold">Sign in</Link>}<ViewToggle to="grid" dark /></div>
    </header>
    {items.length === 0 ? <div className="h-full grid place-items-center text-center px-8"><div><b className="text-lg">No listings yet</b><p className="text-white/60 text-sm mt-1">New verified properties are on the way.</p><Link href="/explore?view=grid" className="btn bg-white text-[#002454] mt-4 h-11 px-5">Browse grid</Link></div></div> :
    <div className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain">{items.map((it) => <Slide key={it.id} it={it} authed={authed} me={me} saved={saved.includes(it.id)} onSave={() => setSaved((a) => [...a, it.id])} />)}</div>}
  </div>);
}
