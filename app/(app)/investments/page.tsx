import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { load } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { naira, nairaShort, wat } from "@/lib/format";
export default async function I() {
  const u = (await currentUser())!; const db = load(); const pays = db.payments.filter((p) => p.userId === u.id); const goals = db.goals.filter((g) => g.userId === u.id);
  const inv = pays.reduce((a, p) => a + p.amount, 0); const saved = goals.reduce((a, g) => a + g.saved, 0);
  return (<div><PageHead title="Investments" sub="Your properties and escrow payments" />
    <div className="px-4 lg:px-8 space-y-4">
      <div className="rounded-3xl bg-navy text-white p-5 relative overflow-hidden"><div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-teal/40 blur-2xl" /><div className="text-xs text-white/60">Portfolio value (in escrow + saved)</div><div className="text-3xl font-extrabold mt-1">{naira(inv + saved)}</div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm"><div><div className="text-white/60 text-xs">In escrow</div><b>{nairaShort(inv)}</b></div><div><div className="text-white/60 text-xs">Savings</div><b>{nairaShort(saved)}</b></div><div><div className="text-white/60 text-xs">Properties</div><b>{pays.length}</b></div></div></div>
      <h2 className="font-bold text-navy">Payments & receipts</h2>
      {pays.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No purchases yet. <Link href="/explore" className="text-teal font-medium">Explore listings</Link></div> :
      <div className="card divide-y divide-silver-200">{pays.map((p) => <Link key={p.ref} href={`/receipt/${p.ref}`} className="flex items-center gap-3 p-4 hover:bg-paper"><span className="w-10 h-10 rounded-xl bg-teal-50 text-teal grid place-items-center"><Icon n="receipt" /></span><div className="flex-1 min-w-0"><div className="font-medium truncate">{p.title}</div><div className="text-xs text-silver">{p.ref} · {wat(p.at)}</div></div><b className="text-navy text-sm">{nairaShort(p.amount)}</b></Link>)}</div>}
    </div></div>);
}
