import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { Cover } from "@/components/Ui";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
export default async function C() {
  const u = await requireUser();
  const th = await prisma.thread.findMany({ where: { OR: [{ buyerId: u.id }, { sellerId: u.id }] }, orderBy: { updatedAt: "desc" }, include: { listing: true, buyer: true, seller: true, messages: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { messages: { where: { readAt: null, fromId: { not: u.id } } } } } } });
  return (<div><PageHead title="Messages" />
    <div className="px-4 lg:px-8">{th.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No conversations yet. Tap the chat icon on any listing.</div> :
    <div className="card divide-y divide-silver-200">{th.map((t) => { const last = t.messages[0]; const asSeller = t.sellerId === u.id; const other = asSeller ? t.buyer.name : (t.seller.businessName || t.seller.name); return (
      <Link key={t.id} href={`/chat/${t.id}`} className="flex gap-3 p-3 hover:bg-paper"><Cover id={t.listingId} src={t.listing.img} alt="" className="w-12 h-12 rounded-full shrink-0" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><b className="text-navy text-sm truncate">{other}{asSeller && <span className="ml-1.5 chip bg-navy-50 text-navy">buyer</span>}</b><span className="text-[11px] text-silver shrink-0">{last ? new Date(last.createdAt).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" }) : ""}</span></div><div className="text-xs text-silver truncate">{t.listing.title}</div><div className="flex justify-between gap-2"><div className="text-sm truncate">{last?.text ?? "No messages yet"}</div>{t._count.messages > 0 && <span className="w-5 h-5 rounded-full bg-teal text-white text-[10px] grid place-items-center shrink-0">{t._count.messages}</span>}</div></div></Link>); })}</div>}</div></div>);
}
