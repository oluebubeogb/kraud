import FacetLink from "@/components/FacetLink";
import SoundVideo from "@/components/SoundVideo";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { ListingCard, StatusChip } from "@/components/Bits";
import { ActionButton, Cover } from "@/components/Ui";
import Gallery from "@/components/Gallery";
import { photos } from "@/lib/photos";
import { getListing, listings } from "@/lib/q";
import { currentUser } from "@/lib/auth";
import { track } from "@/lib/pricing";
import { naira } from "@/lib/format";
import { DealSheet, ModeChip, RiskLine, Avatar } from "@/components/Deal";
import Trust from "@/components/Trust";
import { HORIZON } from "@/lib/deal";
import { specs, attrRows, kindNoun, isAuto } from "@/lib/specs";
export default async function Prop({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await currentUser(); const uid = u?.id ?? ""; const l = await getListing(id); if (!l || (l.moderation !== "Approved" && (!uid || l.sellerId !== uid))) notFound();
  const mine = !!uid && l.sellerId === uid; const d = l.deal; const open = l.raiseStatus === "OPEN"; const canInv = open && d.canInvest && d.seatsLeft > 0; const canBuy = open && d.canBuy && l.seatsTaken === 0; const primary = canInv ? { href: `/checkout/${l.id}?mode=invest`, t: "Invest" } : canBuy ? { href: `/checkout/${l.id}?mode=buy`, t: "Buy" } : null; const similar = (await listings({ city: l.city, NOT: { id: l.id } })).slice(0, 3);
  return (<div className="lg:px-8 lg:pt-6">
    <div className="relative"><Gallery id={l.id} imgs={photos(l).length ? photos(l) : [l.img]} alt={l.title} video={l.videos[0]}>
      <Link href="/explore" className="absolute top-[max(env(safe-area-inset-top),14px)] left-4 w-10 h-10 grid place-items-center rounded-full bg-white/90 text-navy"><Icon n="back" /></Link>
      <div className="pointer-events-none absolute bottom-0 inset-x-0 p-5 text-white"><h1 className="text-xl lg:text-3xl font-extrabold">{l.title}</h1><p className="text-white/80 text-sm flex items-center gap-1 mb-4"><Icon n="pin" className="w-4 h-4" />{l.estate}, {l.city}, {l.state}</p></div></Gallery></div>
    <div className="px-4 lg:px-0 mt-2 relative z-10 lg:mt-6 grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="k-specs rounded-2xl ring-1 ring-navy/5 shadow-card p-3 grid grid-cols-3 gap-2 text-center text-sm">{specs(l).map(([i, t], k) => <FacetLink key={t} q={t.replace(" m²", " m2")} className={`flex flex-col items-center gap-1 text-navy rounded-xl py-2 font-semibold transition-colors hover:brightness-95 ${["wash-blue", "wash-mint", "wash-gold"][k % 3]}`}><Icon n={i} />{t}</FacetLink>)}</div>
        <div className="card p-4"><h2 className="font-bold text-navy">About this {kindNoun(l)}</h2><div className="flex gap-1.5 flex-wrap mt-2"><StatusChip s={l.status} /><ModeChip d={d} /></div><div className="text-sm mt-2 text-navy/80 leading-relaxed space-y-2">{l.desc.split(/\n\s*\n/).map((para, k) => <p key={k}>{para}</p>)}</div>
          {attrRows(l).length > 0 && <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">{attrRows(l).map(([k, v]) => <div key={k} className="rounded-xl bg-navy-50 px-3 py-2"><dt className="text-silver">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>)}</dl>}<div className="mt-3"><Trust compact /></div></div>
        {l.videos.length > 0 && <div className="card p-4"><h2 className="font-bold text-navy mb-2">{isAuto(l) ? "Walkaround video" : "Video tour"}</h2><div className={`grid gap-3 ${l.videos.length > 1 ? "sm:grid-cols-2" : ""}`}>{l.videos.map((v) => <SoundVideo key={v} src={v} poster={l.img} controls playsInline preload="metadata" className="w-full max-h-[70vh] rounded-xl bg-black object-contain" />)}</div></div>}
        <div className="card p-4 space-y-3"><div className="flex items-center justify-between"><h2 className="font-bold text-navy">The deal</h2><span className="chip wash-gold">{HORIZON[d.horizon].label}</span></div><DealSheet d={d} />
          {d.mode !== "BUY" && d.seats > 0 && <div className="grid grid-cols-3 gap-2 text-center text-xs">{([["Needed", d.total, "wash-blue"], ["Maintenance", l.deal.maintenanceCost, "wash-cyan"], ["Completion", l.deal.completionCost, "wash-peach"]] as const).map(([k, v, w]) => <div key={k} className={`k-tile ${w}`}><div className="opacity-70">{k}</div><b>{naira(v)}</b></div>)}</div>}
          <RiskLine /></div>
        {similar.length > 0 && <div><h2 className="font-bold text-navy mb-2">More in {l.city}</h2><div className="grid sm:grid-cols-2 gap-3">{similar.map((x) => <ListingCard key={x.id} l={x} compact />)}</div></div>}
      </div>
      <div className="hidden lg:block"><div className="k-actbar rounded-2xl shadow-card p-5 sticky top-6 space-y-3"><div className="text-2xl font-extrabold text-navy">{canInv ? <>{naira(d.unit)}<span className="text-sm text-navy/60 font-semibold"> /unit</span></> : naira(l.price)}</div>{canInv && canBuy && <div className="text-sm text-navy/70">or buy whole for <b>{naira(l.price)}</b></div>}{!open && <div className="chip wash-coral">{l.raiseStatus === "SOLD" ? "Sold" : l.raiseStatus === "FUNDED" ? "Fully funded" : "Closed"}</div>}<div className="text-sm text-navy/70 flex items-center gap-2"><Avatar src={l.sellerImg} name={l.sellerName} size={28} />Listed by {l.sellerName}</div>
        {mine ? <Link href={`/seller/listing/${l.id}`} className="btn-primary w-full h-12">Edit your listing</Link> : <>{primary && <Link href={primary.href} className="btn-primary w-full h-12">{primary.t}</Link>}
          {u ? <div className="flex items-center justify-center gap-4 pt-1">{canInv && canBuy && <Act label={`Buy whole · ${naira(l.price)}`}><Link href={`/checkout/${l.id}?mode=buy`} aria-label="Buy whole" className="k-actbtn k-blue"><Icon n="cart" className="w-[22px] h-[22px]" /></Link></Act>}
            <Act label="Save toward this"><ActionButton action="goal" body={{ listingId: l.id }} then="/savings" className="k-actbtn"><Icon n="notes" className="w-[22px] h-[22px]" /></ActionButton></Act>
            <Act label="Chat with seller"><ActionButton action="chat-start" body={{ listingId: l.id }} then="/chat/:id" className="k-actbtn"><Icon n="chat" className="w-[22px] h-[22px]" /></ActionButton></Act></div>
          : <>{canInv && canBuy && <Link href={`/checkout/${l.id}?mode=buy`} className="btn-ghost w-full">Buy whole</Link>}<Link href="/signup" className="btn-ghost w-full">Sign up to save or chat</Link><p className="text-xs text-navy/60 text-center">Browsing is free — sign up to invest, buy, save or chat.</p></>}</>}{l.moderation !== "Approved" && <p className="chip bg-silver-200 text-navy">{l.moderation} — not public yet</p>}</div></div>
    </div>
    {!mine && <div className={`k-actbar lg:hidden fixed ${u ? "bottom-16" : "bottom-0"} inset-x-0 z-30 border-x-0 border-b-0 px-4 py-2.5 flex items-center gap-2.5 shadow-[0_-6px_20px_-8px_rgba(0,36,84,.25)]`} style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex-1 min-w-0"><div className="text-[11px] text-navy/60">{canInv ? "Per unit" : "Price"}</div><div className="font-extrabold text-navy truncate">{naira(canInv ? d.unit : l.price)}</div></div>
      {u ? <><Act label="Chat with seller"><ActionButton action="chat-start" body={{ listingId: l.id }} then="/chat/:id" className="k-actbtn"><Icon n="chat" className="w-[22px] h-[22px]" /></ActionButton></Act>
      <Act label="Save toward this"><ActionButton action="goal" body={{ listingId: l.id }} then="/savings" className="k-actbtn"><Icon n="notes" className="w-[22px] h-[22px]" /></ActionButton></Act>
      {canInv && canBuy && <Act label="Buy whole"><Link href={`/checkout/${l.id}?mode=buy`} aria-label="Buy whole" className="k-actbtn k-blue"><Icon n="cart" className="w-[22px] h-[22px]" /></Link></Act>}</> : <Link href="/signup" className="btn-ghost px-3 text-sm">Sign up</Link>}
      {primary ? <Link href={primary.href} className="btn-primary px-5 h-12">{primary.t}</Link> : <span className="chip wash-coral">Closed</span>}</div>}
    <div className="h-20 lg:hidden" /></div>);
}

function Act({ label, children }: { label: string; children: React.ReactNode }) { return <span className="k-act" title={label}>{children}<span className="k-act-tip" role="tooltip">{label}</span></span>; }
