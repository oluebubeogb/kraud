import { notFound } from "next/navigation";
import { PageHead } from "@/components/Bits";
import { ChatBox } from "@/components/Client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
export default async function T({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await requireUser();
  const t = await prisma.thread.findFirst({ where: { id, OR: [{ buyerId: u.id }, { sellerId: u.id }] }, include: { listing: true, buyer: true, seller: true, messages: { orderBy: { createdAt: "asc" }, take: 300 } } }); if (!t) notFound();
  const asSeller = t.sellerId === u.id; const other = asSeller ? t.buyer.name : (t.seller.businessName || t.seller.name);
  return (<div><PageHead title={other} sub={`${asSeller ? "Buyer" : "Verified seller"} · ${t.listing.title}`} back="/chat" /><ChatBox id={t.id} me={u.id} msgs={t.messages.map((m) => ({ from: m.fromId, text: m.text, at: m.createdAt.getTime() }))} placeholder={asSeller ? "Reply to buyer…" : "Message seller…"} /></div>);
}
