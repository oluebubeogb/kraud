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
export default async function Prop({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await currentUser(); const uid = u?.id ?? ""; const l = await getListing(id); if (!l || (l.moderation !== "Approved" && (!uid || l.sellerId !== uid))) notFound();
  const mine = !!uid && l.sellerId === uid; const d = l.deal; const open = l.raiseStatus === "OPEN"; const canInv = open && d.canInvest && d.seatsLeft > 0; const canBuy = open && d.canBuy && l.seatsTaken === 0; const primary = canInv ? { href: `/checkout/${l.id}?mode=invest`, t: "Invest" } : canBuy ? { href: `/checkout/${l.id}?mode=buy`, t: "Buy" } : null; const similar = (await listings({ city: l.city, NOT: { id: l.id } })).slice(0, 3);
  return (<div className="lg:px-8 lg:pt-6">
    <div className="relative"><Gallery id={l.id} imgs={photos(l).length ? photos(l) : [l.img]} alt={l.title}>
      <Link href="/explore" className="absolute top-[max(env(safe-area-inset-top),14px)] left-4 w-10 h-10 grid place-items-center rounded-full bg-white/90 text-navy"><Icon n="back" /></Link>
      <div className="pointer-events-none absolute bottom-0 inset-x-0 p-5 text-white"><div className="flex gap-1.5 flex-wrap"><StatusChip s={l.status} /><ModeChip d={d} dark /></div><h1 className="mt-2 text-xl lg:text-3xl font-extrabold">{l.title}</h1><p className="text-white/80 text-sm flex items-center gap-1"><Icon n="pin" className="w-4 h-4" />{l.estate}, {l.city}, {l.state}</p></div></Gallery></div>
    <div className="px-4 lg:px-0 -mt-4 relative z-10 lg:mt-6 grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-4 grid grid-cols-3 text-center text-sm">{[["bed", l.beds + " beds"], ["bath", l.baths + " baths"], ["area", l.sqm + " m²"]].map(([i, t]) => <div key={t} className="flex flex-col items-center gap-1 text-navy"><Icon n={i} />{t}</div>)}</div>
        <div className="card p-4"><h2 className="font-bold text-navy">About this property</h2><p className="text-sm mt-1 text-navy/80 leading-relaxed">{l.desc}</p><div className="mt-3"><Trust compact /></div></div>
        <div className="card p-4 space-y-3"><div className="flex items-center justify-between"><h2 className="font-bold text-navy">The deal</h2><span className="chip wash-gold">{HORIZON[d.horizon].label}</span></div><DealSheet d={d} />
          {d.mode !== "BUY" && d.seats > 0 && <div className="grid grid-cols-3 gap-2 text-center text-xs">{([["Needed", d.total, "wash-blue"], ["Maintenance", l.deal.maintenanceCost, "wash-cyan"], ["Completion", l.deal.completionCost, "wash-peach"]] as const).map(([k, v, w]) => <div key={k} className={`k-tile ${w}`}><div className="opacity-70">{k}</div><b>{naira(v)}</b></div>)}</div>}
          <RiskLine /></div>
        {similar.length > 0 && <div><h2 className="font-bold text-navy mb-2">More in {l.city}</h2><div className="grid sm:grid-cols-2 gap-3">{similar.map((x) => <ListingCard key={x.id} l={x} compact />)}</div></div>}
      </div>
      <div className="hidden lg:block"><div className="card p-5 sticky top-6 space-y-3"><div className="text-2xl font-extrabold text-navy">{canInv ? <>{naira(d.unit)}<span className="text-sm text-silver font-semibold"> /unit</span></> : naira(l.price)}</div>{canInv && canBuy && <div className="text-sm text-silver">or buy whole for {naira(l.price)}</div>}{!open && <div className="chip wash-coral">{l.raiseStatus === "SOLD" ? "Sold" : l.raiseStatus === "FUNDED" ? "Fully funded" : "Closed"}</div>}<div className="text-sm text-silver flex items-center gap-2"><Avatar src={l.sellerImg} name={l.sellerName} size={28} />Listed by {l.sellerName}</div>
        {mine ? <Link href={`/seller/listing/${l.id}`} className="btn-primary w-full h-12">Edit your listing</Link> : <>{primary && <Link href={primary.href} className="btn-primary w-full h-12">{primary.t}</Link>}{canInv && canBuy && <Link href={`/checkout/${l.id}?mode=buy`} className="btn-ghost w-full">Buy whole</Link>}{u ? <><ActionButton action="goal" body={{ listingId: l.id }} then="/savings" className="btn-ghost w-full">Save toward this</ActionButton><ActionButton action="chat-start" body={{ listingId: l.id }} then="/chat/:id" className="btn-ghost w-full">Chat with seller</ActionButton></> : <><Link href="/signup" className="btn-ghost w-full">Sign up to save or chat</Link><p className="text-xs text-silver text-center">Browsing is free — sign up to invest, buy, save or chat.</p></>}</>}{l.moderation !== "Approved" && <p className="chip bg-silver-200 text-navy">{l.moderation} — not public yet</p>}</div></div>
    </div>
    {!mine && <div className={`lg:hidden fixed ${u ? "bottom-16" : "bottom-0"} inset-x-0 z-30 bg-white border-t border-silver-200 px-4 py-2.5 flex items-center gap-2`} style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex-1 min-w-0"><div className="text-[11px] text-silver">{canInv ? "Per unit" : "Price"}</div><div className="font-extrabold text-navy truncate">{naira(canInv ? d.unit : l.price)}</div></div>
      {u ? <><ActionButton action="chat-start" body={{ listingId: l.id }} then="/chat/:id" className="btn-ghost w-11 px-0"><Icon n="chat" /></ActionButton>
      <ActionButton action="goal" body={{ listingId: l.id }} then="/savings" className="btn-ghost w-11 px-0"><Icon n="piggy" /></ActionButton></> : <Link href="/signup" className="btn-ghost px-3 text-sm">Sign up</Link>}
      {primary ? <Link href={primary.href} className="btn-primary px-6">{primary.t}</Link> : <span className="chip wash-coral">Closed</span>}</div>}
    <div className="h-20 lg:hidden" /></div>);
}
