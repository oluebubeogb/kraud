import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { ChatBox } from "@/components/Client";
import { Avatar } from "@/components/Deal";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getListing } from "@/lib/q";
import { nairaShort } from "@/lib/format";
const intl = (p?: string | null) => { const d = (p || "").replace(/\D/g, ""); return !d ? "" : d.startsWith("234") ? d : d.startsWith("0") ? "234" + d.slice(1) : d; };
export default async function T({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await requireUser();
  const t = await prisma.thread.findFirst({ where: { id, OR: [{ buyerId: u.id }, { sellerId: u.id }] }, include: { listing: true, buyer: { include: { kyc: { select: { phone: true } } } }, seller: { include: { kyc: { select: { phone: true } } } }, messages: { orderBy: { createdAt: "asc" }, take: 300 } } }); if (!t) notFound();
  const asSeller = t.sellerId === u.id; const o = asSeller ? t.buyer : t.seller; const other = asSeller ? t.buyer.name : (t.seller.businessName || t.seller.name);
  const phone = asSeller ? "" : intl(t.seller.kyc?.phone); // only buyers see the seller's registered number
  let prefill = "";
  if (!asSeller && !t.messages.some((m) => m.fromId === u.id)) { const l = await getListing(t.listingId); if (l) { const amt = l.deal.mode !== "BUY" && l.deal.seats ? `${nairaShort(l.deal.unit)}/unit` : nairaShort(l.price); prefill = `Hi — I'm interested in ${l.title} in ${l.estate}, ${l.city} (${amt}). Is it still available?`; } }
  const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(prefill || `Hi — about ${t.listing.title} on Kraud`)}` : "";
  const ib = "w-10 h-10 grid place-items-center rounded-full transition active:scale-90";
  return (<div><header className="sticky top-0 z-30 bg-paper/90 backdrop-blur px-4 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center gap-3">
    <Link href="/chat" className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-card text-navy" aria-label="Back"><Icon n="back" /></Link>
    <Avatar src={o.profileImageUrl} name={other} size={36} /><h1 className="min-w-0 flex-1 text-[16px] font-semibold text-navy truncate">{other}</h1>
    <div className="flex items-center gap-1.5">
      {!asSeller && <>{phone ? <a href={`tel:+${phone}`} className={`${ib} wash-teal`} aria-label="Call"><Icon n="phone" /></a> : <span className={`${ib} wash-navy opacity-40`} title="No phone on file"><Icon n="phone" /></span>}
      {wa ? <a href={wa} target="_blank" rel="noopener" className={`${ib} wash-mint`} aria-label="WhatsApp"><Icon n="whatsapp" /></a> : <span className={`${ib} wash-navy opacity-40`} title="No WhatsApp on file"><Icon n="whatsapp" /></span>}</>}
      <Link href={`/u/${o.id}`} className={`${ib} wash-violet`} aria-label={asSeller ? "Buyer profile" : "Seller's properties"}><Icon n="user" /></Link></div></header>
    <ChatBox id={t.id} me={u.id} prefill={prefill} msgs={t.messages.map((m) => ({ from: m.fromId, text: m.text, at: m.createdAt.getTime() }))} placeholder={asSeller ? "Reply to buyer…" : "Message seller…"} /></div>);
}
