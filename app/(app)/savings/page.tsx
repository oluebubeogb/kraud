import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { TopUp, Withdraw } from "@/components/Client";
import { prisma } from "@/lib/db";
import { currentUser, requireUser, kycOk } from "@/lib/auth";
import { naira, wat } from "@/lib/format";
export default async function S() {
  const u = await requireUser(); const goals = await prisma.goal.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, include: { withdrawals: { orderBy: { createdAt: "desc" }, take: 3 } } });
  return (<div><PageHead title="Target savings" sub="Save toward a specific property — not a bank account" />
    <div className="px-4 lg:px-8 space-y-4 max-w-2xl">
      {goals.length === 0 && <div className="card p-6 text-center text-sm"><b className="text-navy">No goals yet</b><p className="text-silver mt-1">Open any listing and tap the savings icon to start a target pot.</p><Link href="/explore" className="btn-primary mt-4">Find a property</Link></div>}
      {goals.map((g) => { const saved = Number(g.saved), target = Number(g.target); const pct = Math.min(100, Math.round((saved / target) * 100)); return (<div key={g.id} className="card p-4 space-y-3">
        <div className="flex justify-between gap-3"><div className="min-w-0"><div className="text-xs text-silver">Saving toward</div>{g.listingId ? <Link href={`/property/${g.listingId}`} className="font-bold text-navy truncate block">{g.title}</Link> : <b className="text-navy">{g.title}</b>}</div><span className="chip bg-teal-50 text-teal h-fit">{pct}%</span></div>
        <div className="h-2.5 rounded-full bg-silver-200 overflow-hidden"><div className="h-full bg-gradient-to-r from-navy to-teal" style={{ width: pct + "%" }} /></div>
        <div className="flex justify-between text-sm"><span><b className="text-navy">{naira(saved)}</b> saved</span><span className="text-silver">of {naira(target)}</span></div>
        <TopUp id={g.id} />{kycOk(u) && <Withdraw goalId={g.id} amount={saved} />}
        {g.withdrawals.map((w) => <div key={w.id} className="text-xs text-silver">Withdrawal {naira(Number(w.amount))} · {w.status} · {wat(w.createdAt)}</div>)}</div>); })}
      {goals.length > 0 && !kycOk(u) && <p className="text-xs text-silver">Withdrawals require one-off KYC — complete it in <Link href="/profile" className="text-teal underline">Profile</Link>.</p>}
    </div></div>);
}
