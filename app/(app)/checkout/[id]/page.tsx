import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/Bits";
import { Checkout, KycForm } from "@/components/Client";
import { Cover } from "@/components/Ui";
import { listings } from "@/lib/q";
import { currentUser } from "@/lib/auth";
import { naira } from "@/lib/format";
export default async function P({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const l = listings().find((x) => x.id === id); if (!l) notFound(); const u = (await currentUser())!;
  const blocked = !u.verified ? <div className="card p-5 text-sm"><b className="text-navy">Verify your email first.</b><p className="text-silver mt-1">Use the banner above to resend or open the dev link.</p></div> : !u.kyc ? <div className="card p-5"><h2 className="font-bold text-navy mb-1">One-off KYC</h2><p className="text-sm text-silver mb-4">Required once before buying or withdrawing.</p><KycForm /></div> : undefined;
  return (<div className="max-w-xl"><PageHead title="Checkout" sub="Escrow-protected purchase" back={`/property/${l.id}`} />
    <div className="px-4 lg:px-8 space-y-4"><div className="card p-3 flex gap-3"><Cover id={l.id} src={l.img} alt="" className="w-20 h-20 rounded-xl shrink-0" /><div className="min-w-0"><div className="font-semibold truncate">{l.title}</div><div className="text-xs text-silver truncate">{l.estate}, {l.city}</div><div className="font-bold text-navy mt-1">{naira(l.price)}</div></div></div>
      <Checkout id={l.id} price={l.price} title={l.title} blocked={blocked} /><p className="text-xs text-silver text-center">Funds are held by Kraud's escrow agent until handover. <Link href="/profile" className="underline">Terms</Link></p></div></div>);
}
