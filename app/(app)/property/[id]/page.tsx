import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { FeaturedTag, ListingCard, StatusChip } from "@/components/Bits";
import { ActionButton, Cover } from "@/components/Ui";
import { featured, getListing, listings } from "@/lib/q";
import { requireUser } from "@/lib/auth";
import { track } from "@/lib/pricing";
import { naira } from "@/lib/format";
export default async function Prop({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await requireUser(); const l = await getListing(id); if (!l || (l.moderation !== "Approved" && l.sellerId !== u.id)) notFound();
  const mine = l.sellerId === u.id; const imm = (await featured("immersive")).find((x) => x.id !== l.id); const similar = (await listings({ city: l.city, NOT: { id: l.id } })).slice(0, 3); if (imm) await track("immersive", l.city);
  return (<div className="lg:px-8 lg:pt-6">
    <div className="relative"><Cover id={l.id} src={l.img} alt={l.title} className="h-[52vh] lg:h-[60vh] lg:rounded-3xl" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 lg:rounded-3xl" />
      <Link href="/explore" className="absolute top-[max(env(safe-area-inset-top),14px)] left-4 w-10 h-10 grid place-items-center rounded-full bg-white/90 text-navy"><Icon n="back" /></Link>
      {l.featured?.includes("immersive") && <span className="absolute top-[max(env(safe-area-inset-top),18px)] right-4"><FeaturedTag slot="Immersive" /></span>}
      <div className="absolute bottom-0 inset-x-0 p-5 text-white"><StatusChip s={l.status} /><h1 className="mt-2 text-2xl lg:text-4xl font-extrabold">{l.title}</h1><p className="text-white/80 text-sm flex items-center gap-1"><Icon n="pin" className="w-4 h-4" />{l.estate}, {l.city}, {l.state}</p></div></div>
    <div className="px-4 lg:px-0 -mt-4 relative z-10 lg:mt-6 grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-4 grid grid-cols-3 text-center text-sm">{[["bed", l.beds + " beds"], ["bath", l.baths + " baths"], ["area", l.sqm + " m²"]].map(([i, t]) => <div key={t} className="flex flex-col items-center gap-1 text-navy"><Icon n={i} />{t}</div>)}</div>
        <div className="card p-4"><h2 className="font-bold text-navy">About this property</h2><p className="text-sm mt-1 text-navy/80 leading-relaxed">{l.desc}</p><div className="mt-3 flex items-center gap-2 text-xs text-teal"><Icon n="shield" className="w-4 h-4" />Seller verified · Title documents reviewed · Escrow protected</div></div>
        {imm && <Link href={`/property/${imm.id}`} className="block relative rounded-3xl overflow-hidden group"><Cover id={imm.id} src={imm.img} alt="" className="h-64 group-hover:scale-[1.02] transition duration-700" /><div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-transparent" /><div className="absolute inset-0 p-5 flex flex-col justify-end text-white max-w-xs"><FeaturedTag slot="Immersive" /><div className="mt-2 text-xl font-bold">{imm.title}</div><div className="text-sm text-white/80">{imm.estate} · {naira(imm.price)}</div><span className="mt-2 text-sm flex items-center gap-1"><Icon n="expand" className="w-4 h-4" />Enter immersive tour</span></div></Link>}
        {similar.length > 0 && <div><h2 className="font-bold text-navy mb-2">More in {l.city}</h2><div className="grid sm:grid-cols-2 gap-3">{similar.map((x) => <ListingCard key={x.id} l={x} compact />)}</div></div>}
      </div>
      <div className="hidden lg:block"><div className="card p-5 sticky top-6 space-y-3"><div className="text-3xl font-extrabold text-navy">{naira(l.price)}</div><div className="text-sm text-silver">Listed by {l.sellerName}</div>
        {mine ? <Link href={`/seller/listing/${l.id}`} className="btn-primary w-full h-12">Edit your listing</Link> : <><Link href={`/checkout/${l.id}`} className="btn-primary w-full h-12">Buy now</Link><ActionButton action="goal" body={{ listingId: l.id }} then="/savings" className="btn-ghost w-full">Save toward this home</ActionButton><ActionButton action="chat-start" body={{ listingId: l.id }} then="/chat/:id" className="btn-ghost w-full">Chat with seller</ActionButton></>}{l.moderation !== "Approved" && <p className="chip bg-silver-200 text-navy">{l.moderation} — not public yet</p>}</div></div>
    </div>
    {!mine && <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-silver-200 px-4 py-2.5 flex items-center gap-2" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex-1 min-w-0"><div className="text-[11px] text-silver">Price</div><div className="font-extrabold text-navy truncate">{naira(l.price)}</div></div>
      <ActionButton action="chat-start" body={{ listingId: l.id }} then="/chat/:id" className="btn-ghost w-11 px-0"><Icon n="chat" /></ActionButton>
      <ActionButton action="goal" body={{ listingId: l.id }} then="/savings" className="btn-ghost w-11 px-0"><Icon n="piggy" /></ActionButton>
      <Link href={`/checkout/${l.id}`} className="btn-primary px-6">Buy</Link></div>}
    <div className="h-20 lg:hidden" /></div>);
}
