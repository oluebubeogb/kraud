import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { ActionButton, Cover } from "@/components/Ui";
import Tip from "@/components/Tip";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { exitQuote } from "@/lib/deal";
import { naira, nairaShort, wat } from "@/lib/format";
const ST: Record<string, string> = { PAID: "Paid", REFUNDED: "Refunded", PENDING: "Pending", FAILED: "Failed", RELEASED: "Paid", HELD: "Paid" };
const US: Record<string, [string, string]> = { ACTIVE: ["Active", "wash-mint"], SELL_REQUESTED: ["Selling", "wash-gold"], SOLD: ["Sold", "wash-blue"], REFUNDED: ["Refunded", "wash-coral"], PAID_OUT: ["Paid out", "wash-violet"] };
export default async function I() {
  const u = await requireUser();
  const [pays, units, vaults, goals] = await Promise.all([
    prisma.payment.findMany({ where: { userId: u.id, status: { not: "FAILED" } }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.investmentUnit.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, include: { listing: { select: { id: true, title: true, img: true, city: true, raiseStatus: true } }, sales: { where: { status: "REQUESTED" } } } }),
    prisma.savingsVault.findMany({ where: { userId: u.id, status: "ACTIVE" } }), prisma.goal.findMany({ where: { userId: u.id } })]);
  const whole = pays.filter((p) => (p.kind === "PURCHASE" || p.kind === "DEPOSIT") && p.status !== "PENDING" && p.status !== "REFUNDED");
  const live = units.filter((x) => x.status === "ACTIVE" || x.status === "SELL_REQUESTED");
  const invested = live.reduce((a, x) => a + Number(x.invested), 0); const profit = live.reduce((a, x) => a + Number(x.expectedProfit), 0);
  const owned = whole.reduce((a, p) => a + Number(p.amount), 0); const saved = vaults.reduce((a, v) => a + Number(v.balance), 0) + goals.reduce((a, g) => a + Number(g.saved), 0);
  const tiles = [["Co-owned", nairaShort(invested), "wash-mint", "users"], ["Expected profit", nairaShort(profit), "wash-gold", "trend"], ["Owned whole", nairaShort(owned), "wash-blue", "key"], ["Savings", nairaShort(saved), "wash-violet", "notes"]] as const;
  return (<div><PageHead title="Portfolio" sub="Own Together. Grow Together." />
    <div className="px-4 lg:px-8 space-y-5">
      <div className="rounded-3xl wash-soft ring-1 ring-black/[.03] p-5 relative k-rise">
        <div className="text-xs text-silver flex items-center gap-1">Total expected profit<Tip text="Sum of projected profit on your active units. Estimates, not guarantees." /></div><div className="text-2xl font-extrabold mt-1">{naira(profit)}</div>
        <div className="mt-1 text-sm text-silver">on {naira(invested)} co-owned · wallet {naira(Number(u.walletBalance))}</div></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{tiles.map(([k, v, w, i]) => <div key={k} className={`k-tile ${w} flex items-center gap-3`}><span className="w-9 h-9 rounded-xl bg-white/70 grid place-items-center"><Icon n={i} className="w-4 h-4" /></span><div><div className="text-[11px] opacity-75">{k}</div><b className="text-base">{v}</b></div></div>)}</div>
      <section><h2 className="font-bold text-navy mb-2">Your units</h2>
        {units.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No co-owned units yet. <Link href="/explore?mode=invest" className="text-teal font-medium">Find a raise</Link></div> :
        <div className="grid md:grid-cols-2 gap-3">{units.map((x) => { const q = exitQuote({ invested: Number(x.invested), expectedProfit: Number(x.expectedProfit), createdAt: x.createdAt, maturesAt: x.maturesAt }); const [lab, w] = US[x.status] || [x.status, "wash-blue"]; return (
          <div key={x.id} className="card p-3 space-y-3 k-pop"><div className="flex gap-3"><Cover id={x.listing.id} src={x.listing.img} alt="" className="w-16 h-16 rounded-xl shrink-0" /><div className="min-w-0 flex-1"><Link href={`/property/${x.listing.id}`} className="font-semibold text-navy truncate block">{x.listing.title}</Link><div className="text-xs text-silver">{x.units} unit{x.units > 1 ? "s" : ""} · since {wat(x.createdAt)}</div><span className={`chip mt-1 ${w}`}>{lab}</span></div></div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="k-tile wash-blue"><div className="opacity-70">Invested</div><b>{nairaShort(Number(x.invested))}</b></div><div className="k-tile wash-mint"><div className="opacity-70">Exp. profit</div><b>{nairaShort(Number(x.expectedProfit))}</b></div><div className="k-tile wash-gold"><div className="opacity-70">Matures</div><b>{x.maturesAt.toLocaleDateString("en-NG", { month: "short", year: "numeric" })}</b></div></div>
            {x.status === "ACTIVE" && (q.eligible ? <div className="rounded-xl bg-paper p-3 text-xs space-y-2"><div className="flex justify-between"><span className="text-silver flex items-center gap-1">Sell now<Tip text="Selling early forfeits 50% of profit earned so far. The rest goes to your wallet once a new co-owner takes your units." /></span><b className="text-navy">{naira(q.refund)}</b></div><ActionButton action="unit-sell" body={{ id: x.id }} className="btn-ghost w-full h-10">Sell units</ActionButton></div>
              : <p className="text-[11px] text-silver flex items-center gap-1"><Icon n="clock" className="w-3.5 h-3.5" />Sellable from {q.eligibleAt.toDateString()}</p>)}
            {x.status === "SELL_REQUESTED" && <div className="flex items-center justify-between text-xs"><span className="text-silver">Matching a buyer · {naira(Number(x.sales[0]?.refund ?? 0))} to wallet</span><ActionButton action="unit-sell-cancel" body={{ id: x.id }} className="text-teal underline">Cancel</ActionButton></div>}
            {x.status === "PAID_OUT" && x.payout != null && <p className="text-xs text-teal">Paid {naira(Number(x.payout))} to wallet{x.paidOutAt ? ` · ${wat(x.paidOutAt)}` : ""}</p>}</div>); })}</div>}</section>
      {whole.length > 0 && <section><h2 className="font-bold text-navy mb-2">Bought whole</h2><div className="card divide-y divide-silver-200">{whole.map((p) => <Link key={p.ref} href={`/receipt/${p.ref}`} className="flex items-center gap-3 p-4 hover:bg-paper"><span className="w-10 h-10 rounded-xl wash-blue grid place-items-center shrink-0"><Icon n="key" /></span><div className="flex-1 min-w-0"><div className="font-medium truncate">{p.title}</div><div className="text-xs text-silver">{wat(p.paidAt || p.createdAt)}</div></div><b className="text-navy text-sm">{nairaShort(Number(p.amount))}</b></Link>)}</div></section>}
      <section><h2 className="font-bold text-navy mb-2">Receipts</h2>
        {pays.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No payments yet.</div> :
        <div className="card divide-y divide-silver-200">{pays.map((p) => <Link key={p.ref} href={`/receipt/${p.ref}`} className="flex items-center gap-3 p-4 hover:bg-paper"><span className="w-10 h-10 rounded-xl bg-teal-50 text-teal grid place-items-center shrink-0"><Icon n="receipt" /></span><div className="flex-1 min-w-0"><div className="font-medium truncate">{p.title}</div><div className="text-xs text-silver">{p.ref} · {wat(p.paidAt || p.createdAt)} · {ST[p.status] || p.status}</div></div><b className="text-navy text-sm">{nairaShort(Number(p.amount))}</b></Link>)}</div>}</section>
    </div></div>);
}
