import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser, requireUser, isAdmin } from "@/lib/auth";
import { naira, wat } from "@/lib/format";
const LABEL: Record<string, string> = { HELD: "Paid", RELEASED: "Paid", REFUNDED: "Refunded", PAID: "Paid", PENDING: "Awaiting payment", FAILED: "Failed" };
export default async function R({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params; const u = await requireUser(); const p = await prisma.payment.findUnique({ where: { ref }, include: { user: true } }); if (!p || (p.userId !== u.id && !isAdmin(u))) notFound();
  const rows: [string, string][] = [["Reference", p.ref], ["Monnify ref", p.providerRef?.replace(/^SIM\|/, "SIM ") || "—"], ["Description", p.title], ["Customer", `${p.user.name} (@${p.user.username})`], ["Payment method", p.method || "—"], ["Date", p.paidAt ? wat(p.paidAt) : "—"], ["Amount", naira(Number(p.amount))], ...(p.units ? [["Units", String(p.units)] as [string, string]] : []), ["Insurance + due diligence", naira(Number(p.fee))]];
  if (p.kind === "PURCHASE" || p.kind === "DEPOSIT") rows.push(["Settlement", p.status === "PAID" ? "Settled to seller" : "—"]); else if (p.kind === "INVEST") rows.push(["Held in", "Kraud raise pool (insured)"]);
  return (<div className="px-4 lg:px-8 py-6 max-w-lg mx-auto">
    <div className="card overflow-hidden"><div className="bg-navy text-white p-5 flex items-center gap-3"><img src="/mark.png" alt="" className="w-10 h-10" /><div><div className="font-extrabold text-lg">kraud</div><div className="text-xs text-white/70">Official payment receipt</div></div><span className="ml-auto chip bg-teal text-white">{LABEL[p.status]}</span></div>
      <div className="p-5"><div className="text-center py-3"><div className="text-xs text-silver">Total</div><div className="text-3xl font-extrabold text-navy">{naira(Number(p.amount + p.fee))}</div></div>
        <dl className="divide-y divide-silver-200 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-silver">{k}</dt><dd className="text-right font-medium break-all">{v}</dd></div>)}</dl>
        <p className="mt-4 text-[11px] text-silver">Processed via Monnify or your Kraud wallet. Co-own units are pooled for the raise; whole purchases settle to the seller. Times in West Africa Time (WAT).</p></div></div>
    <div className="mt-4 grid grid-cols-2 gap-3">{p.paidAt ? <a href={`/receipt-pdf/${p.ref}`} className="btn-ghost">Download PDF</a> : p.checkoutUrl ? <a href={p.checkoutUrl} className="btn-ghost">Complete payment</a> : <span />}<Link href="/investments" className="btn-primary">View portfolio</Link></div></div>);
}
