import Link from "next/link";
import { notFound } from "next/navigation";
import { load } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { naira, wat } from "@/lib/format";
import { PrintBtn } from "./print";
export default async function R({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params; const u = (await currentUser())!; const p = load().payments.find((x) => x.ref === ref && x.userId === u.id); if (!p) notFound();
  const rows: [string, string][] = [["Reference", p.ref], ["Property", p.title], ["Buyer", `${u.name} (@${u.username})`], ["Payment method", p.method], ["Date", wat(p.at)], ["Amount", naira(p.amount)], ["Escrow fee", naira(p.fee)]];
  return (<div className="px-4 lg:px-8 py-6 max-w-lg mx-auto">
    <div className="card overflow-hidden print:shadow-none"><div className="bg-navy text-white p-5 flex items-center gap-3"><img src="/mark.png" alt="" className="w-10 h-10" /><div><div className="font-extrabold text-lg">kraud</div><div className="text-xs text-white/70">Official payment receipt</div></div><span className="ml-auto chip bg-teal text-white">{p.status}</span></div>
      <div className="p-5"><div className="text-center py-3"><div className="text-xs text-silver">Total paid</div><div className="text-3xl font-extrabold text-navy">{naira(p.amount + p.fee)}</div></div>
        <dl className="divide-y divide-silver-200 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-silver">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
        <p className="mt-4 text-[11px] text-silver">Processed via Monnify. Held by Kraud Escrow Agent until handover. Keep this reference for disputes. Times shown in West Africa Time (WAT).</p></div></div>
    <div className="mt-4 grid grid-cols-2 gap-3 print:hidden"><PrintBtn /><Link href="/investments" className="btn-primary">View investments</Link></div></div>);
}
