import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { naira, nairaShort, wat } from "@/lib/format";
const ST: Record<string, string> = { HELD: "In escrow", RELEASED: "Completed", REFUNDED: "Refunded", PAID: "Paid", PENDING: "Pending", FAILED: "Failed" };
export default async function I() {
  const u = await requireUser(); const [pays, goals] = await Promise.all([prisma.payment.findMany({ where: { userId: u.id, status: { not: "FAILED" } }, orderBy: { createdAt: "desc" } }), prisma.goal.findMany({ where: { userId: u.id } })]);
  const escrow = pays.filter((p) => p.status === "HELD").reduce((a, p) => a + Number(p.amount), 0); const owned = pays.filter((p) => p.status === "RELEASED").reduce((a, p) => a + Number(p.amount), 0); const saved = goals.reduce((a, g) => a + Number(g.saved), 0);
  return (<div><PageHead title="Portfolio" sub="Your properties, escrow payments and receipts" />
    <div className="px-4 lg:px-8 space-y-4">
      <div className="rounded-3xl bg-navy text-white p-5 relative overflow-hidden"><div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-teal/40 blur-2xl" /><div className="text-xs text-white/60">Total committed</div><div className="text-3xl font-extrabold mt-1">{naira(escrow + owned + saved)}</div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm"><div><div className="text-white/60 text-xs">In escrow</div><b>{nairaShort(escrow)}</b></div><div><div className="text-white/60 text-xs">Owned</div><b>{nairaShort(owned)}</b></div><div><div className="text-white/60 text-xs">Savings</div><b>{nairaShort(saved)}</b></div></div></div>
      <h2 className="font-bold text-navy">Payments & receipts</h2>
      {pays.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No payments yet. <Link href="/explore" className="text-teal font-medium">Explore listings</Link></div> :
      <div className="card divide-y divide-silver-200">{pays.map((p) => <Link key={p.ref} href={`/receipt/${p.ref}`} className="flex items-center gap-3 p-4 hover:bg-paper"><span className="w-10 h-10 rounded-xl bg-teal-50 text-teal grid place-items-center shrink-0"><Icon n="receipt" /></span><div className="flex-1 min-w-0"><div className="font-medium truncate">{p.title}</div><div className="text-xs text-silver">{p.ref} · {wat(p.paidAt || p.createdAt)} · {ST[p.status]}</div></div><b className="text-navy text-sm">{nairaShort(Number(p.amount))}</b></Link>)}</div>}
    </div></div>);
}
