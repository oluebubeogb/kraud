import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { TopUp, Withdraw, WalletTopUp, VaultCreate, VaultTopUp } from "@/components/Client";
import { ActionButton } from "@/components/Ui";
import Tip from "@/components/Tip";
import { prisma } from "@/lib/db";
import { requireUser, kycOk } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { accrueVault } from "@/lib/wallet";
import { naira, wat } from "@/lib/format";
export default async function S() {
  const u = await requireUser(); const st = await getSettings();
  const ids = (await prisma.savingsVault.findMany({ where: { userId: u.id, status: "ACTIVE" }, select: { id: true } })).map((v) => v.id);
  if (ids.length) await prisma.$transaction(async (tx) => { for (const id of ids) await accrueVault(tx, id); });
  const [goals, vaults, txs] = await Promise.all([prisma.goal.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, include: { withdrawals: { orderBy: { createdAt: "desc" }, take: 3 } } }),
    prisma.savingsVault.findMany({ where: { userId: u.id, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }), prisma.walletTx.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 8 })]);
  const wallet = Number(u.walletBalance);
  return (<div><PageHead title="Savings & wallet" sub="Save toward a property, or grow a locked vault" />
    <div className="px-4 lg:px-8 grid lg:grid-cols-2 gap-4 items-start">
      <div className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-teal to-navy text-white p-5 space-y-3 k-rise"><div className="flex items-center gap-2 text-xs text-white/70"><Icon n="wallet" className="w-4 h-4" />Kraud wallet<Tip text="Refunds, sales, payouts and referral rewards land here. Use it to invest instantly." /></div><div className="text-3xl font-extrabold">{naira(wallet)}</div>
          <div className="rounded-2xl bg-white p-3 text-navy space-y-2"><WalletTopUp />{kycOk(u) && wallet >= 1000 && <Withdraw amount={wallet} source="wallet" />}</div></div>
        {txs.length > 0 && <div className="card divide-y divide-silver-200">{txs.map((t) => <div key={t.id} className="flex items-center justify-between p-3 text-sm"><div className="min-w-0"><div className="truncate">{t.memo}</div><div className="text-[11px] text-silver">{wat(t.createdAt)}</div></div><b className={Number(t.amount) < 0 ? "text-navy" : "text-teal"}>{Number(t.amount) < 0 ? "−" : "+"}{naira(Math.abs(Number(t.amount)))}</b></div>)}</div>}
        <div className="card p-4 space-y-3"><h2 className="font-bold text-navy flex items-center gap-1.5">Savings vaults<Tip text="Rates are set by Kraud and fixed when you open a vault. Closing early forfeits interest." /></h2><VaultCreate r3={st["rate:vault3"]} r12={st["rate:vault12"]} /></div>
        {vaults.map((v) => { const matured = v.lockedUntil <= new Date(); return (<div key={v.id} className={`rounded-2xl p-4 space-y-3 ${v.lockMonths === 3 ? "wash-gold" : "wash-mint"}`}>
          <div className="flex justify-between"><div><b className="text-navy">{v.title}</b><div className="text-xs opacity-75">{v.ratePct}% p.a. · {matured ? "matured" : `locked until ${v.lockedUntil.toDateString()}`}</div></div><div className="text-right"><b className="text-navy">{naira(Number(v.balance))}</b><div className="text-xs">+{naira(Number(v.interest))} interest</div></div></div>
          {!matured && <VaultTopUp id={v.id} wallet={wallet} />}<ActionButton action="vault-withdraw" body={{ id: v.id }} className="btn-ghost w-full h-10 bg-white/70">{matured ? "Withdraw to wallet" : "Close early (forfeit interest)"}</ActionButton></div>); })}
      </div>
      <div className="space-y-4"><h2 className="font-bold text-navy">Property goals</h2>
        {goals.length === 0 && <div className="card p-6 text-center text-sm"><b className="text-navy">No goals yet</b><p className="text-silver mt-1">Tap Save on any listing to start a target pot.</p><Link href="/explore" className="btn-primary mt-4">Find a property</Link></div>}
        {goals.map((g) => { const saved = Number(g.saved), target = Number(g.target); const pct = Math.min(100, Math.round((saved / target) * 100)); return (<div key={g.id} className="card p-4 space-y-3">
          <div className="flex justify-between gap-3"><div className="min-w-0"><div className="text-xs text-silver">Saving toward</div>{g.listingId ? <Link href={`/property/${g.listingId}`} className="font-bold text-navy truncate block">{g.title}</Link> : <b className="text-navy">{g.title}</b>}</div><span className="chip wash-mint h-fit">{pct}%</span></div>
          <div className="k-bar"><i style={{ width: pct + "%" }} /></div>
          <div className="flex justify-between text-sm"><span><b className="text-navy">{naira(saved)}</b> saved</span><span className="text-silver">of {naira(target)}</span></div>
          <TopUp id={g.id} />{kycOk(u) && <Withdraw goalId={g.id} amount={saved} />}
          {g.withdrawals.map((w) => <div key={w.id} className="text-xs text-silver">Withdrawal {naira(Number(w.amount))} · {w.status} · {wat(w.createdAt)}</div>)}</div>); })}
        {!kycOk(u) && <p className="text-xs text-silver">Withdrawals need one-off KYC — complete it in <Link href="/profile" className="text-teal underline">Profile</Link>.</p>}
      </div></div></div>);
}
