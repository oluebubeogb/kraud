"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { post } from "@/components/Ui";
import { naira } from "@/lib/format";
export type FeedItem = { id: string; title: string; price: number; city: string; state: string; estate: string; desc: string; beds: number; baths: number; sqm: number; status: string; type: string; seller: string; sellerId: string; imgs: string[]; featured: boolean };
const ini = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const useLS = (k: string) => { const [v, setV] = useState<string[]>([]); useEffect(() => { try { setV(JSON.parse(localStorage.getItem(k) || "[]")); } catch {} }, [k]); const toggle = (id: string) => setV((a) => { const n = a.includes(id) ? a.filter((x) => x !== id) : [...a, id]; localStorage.setItem(k, JSON.stringify(n)); return n; }); return [v, toggle] as const; };

function Act({ icon, label, on, onClick, href }: { icon: string; label: string; on?: boolean; onClick?: () => void; href?: string }) {
  const inner = <><span className={`w-12 h-12 rounded-full grid place-items-center backdrop-blur-md ring-1 transition active:scale-90 ${on ? "bg-[#1F7A72] ring-[#1F7A72] text-white" : "bg-[#002454]/45 ring-white/15 text-white"}`}><Icon n={icon} className="w-6 h-6" /></span><span className="text-[11px] font-semibold text-white/90 drop-shadow">{label}</span></>;
  return href ? <Link href={href} className="flex flex-col items-center gap-1" aria-label={label}>{inner}</Link> : <button onClick={onClick} className="flex flex-col items-center gap-1" aria-label={label}>{inner}</button>;
}

function Slide({ it, authed, me, liked, saved, onLike, onSave }: { it: FeedItem; authed: boolean; me: string | null; liked: boolean; saved: boolean; onLike: () => void; onSave: () => void }) {
  const r = useRouter(); const [i, setI] = useState(0); const [toast, setToast] = useState(""); const strip = useRef<HTMLDivElement>(null);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1800); };
  const chat = async () => { if (!authed) return r.push("/signup"); if (me === it.sellerId) return flash("This is your listing"); try { const d = await post("chat-start", { listingId: it.id }); r.push(`/chat/${d.id}`); } catch (e: any) { flash(e.message); } };
  const save = () => { if (!authed) return r.push("/signup"); onSave(); flash(saved ? "Removed from saved" : "Saved"); };
  const share = async () => { const url = `${location.origin}/property/${it.id}`; try { if (navigator.share) await navigator.share({ title: it.title, text: `${it.title} · ${naira(it.price)} on Kraud`, url }); else { await navigator.clipboard.writeText(url); flash("Link copied"); } } catch {} };
  return (<section className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-[#001a3d]">
    <div className="absolute inset-0 scale-110 blur-2xl opacity-60" style={{ backgroundImage: `url(${it.imgs[i]})`, backgroundSize: "cover", backgroundPosition: "center" }} />
    <div className="absolute inset-0 bg-gradient-to-b from-[#002454]/60 via-[#002454]/20 to-[#001a3d]/95" />
    <div ref={strip} onScroll={(e) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); }} className="absolute inset-x-0 top-[18%] h-[46%] flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
      {it.imgs.map((src, k) => <div key={k} className="w-full h-full shrink-0 snap-center px-3 md:px-0 flex items-center justify-center"><img src={src} alt={it.title} loading={k ? "lazy" : "eager"} onDoubleClick={() => !liked && onLike()} className="max-h-full w-full md:w-auto object-cover rounded-3xl shadow-2xl ring-1 ring-white/10" /></div>)}
    </div>
    {it.imgs.length > 1 && <div className="absolute top-[65%] inset-x-0 flex justify-center gap-1.5">{it.imgs.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />)}</div>}
    <div className="absolute right-3 bottom-[calc(env(safe-area-inset-bottom)+28px)] flex flex-col gap-4 z-10">
      <Act icon="heart" label={liked ? "Liked" : "Like"} on={liked} onClick={onLike} />
      <Act icon="chat" label="Chat" onClick={chat} />
      <Act icon="bookmark" label={saved ? "Saved" : "Save"} on={saved} onClick={save} />
      <Act icon="send" label="Share" onClick={share} />
      <Act icon="expand" label="Open" href={`/property/${it.id}`} />
    </div>
    <div className="absolute left-4 right-20 bottom-[calc(env(safe-area-inset-bottom)+24px)] text-white z-10">
      <div className="flex items-center gap-2.5"><span className="w-9 h-9 rounded-full bg-[#1F7A72] grid place-items-center text-xs font-bold ring-2 ring-white/20">{ini(it.seller)}</span><b className="text-[15px] truncate">{it.seller}</b></div>
      <h2 className="mt-3 text-xl font-extrabold leading-snug">{it.title}</h2>
      <div className="mt-1 text-lg font-bold text-[#7FC4BD]">{naira(it.price)}</div>
      <div className="mt-1 flex items-center gap-1 text-sm text-white/80"><Icon n="pin" className="w-4 h-4" /><span className="truncate">{it.estate}, {it.city}, {it.state}</span></div>
      <p className="mt-2 text-sm text-white/75 line-clamp-2">{it.desc}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 text-[13px] font-semibold text-white/90"><span>#{it.type}</span><span>#{it.status}</span><span>{it.beds} bd · {it.baths} ba · {it.sqm} m²</span></div>
    </div>
    {toast && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full bg-[#002454]/90 text-white text-sm px-4 py-2">{toast}</div>}
  </section>);
}

export default function Feed({ items, authed, me }: { items: FeedItem[]; authed: boolean; me: string | null }) {
  const r = useRouter(); const [liked, like] = useLS("kraud.likes"); const [saved, save] = useLS("kraud.saved");
  return (<div className="fixed inset-0 bg-[#001a3d] text-white">
    <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-[max(env(safe-area-inset-top),12px)] pb-2 pointer-events-none">
      <button onClick={() => (history.length > 1 ? r.back() : r.push("/"))} className="pointer-events-auto w-11 h-11 rounded-full bg-white/10 backdrop-blur grid place-items-center" aria-label="Back"><Icon n="back" /></button>
      <h1 className="font-bold text-lg">For you</h1>
      <Link href="/explore?view=grid" className="pointer-events-auto w-11 h-11 rounded-full bg-white/10 backdrop-blur grid place-items-center" aria-label="Grid view"><Icon n="grid" /></Link>
    </header>
    {items.length === 0 ? <div className="h-full grid place-items-center text-center px-8"><div><b className="text-lg">No listings yet</b><p className="text-white/60 text-sm mt-1">New verified properties are on the way.</p><Link href="/" className="btn bg-white text-[#002454] mt-4 h-11 px-5">Back home</Link></div></div> :
    <div className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain">{items.map((it) => <Slide key={it.id} it={it} authed={authed} me={me} liked={liked.includes(it.id)} saved={saved.includes(it.id)} onLike={() => like(it.id)} onSave={() => save(it.id)} />)}</div>}
  </div>);
}
