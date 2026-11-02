import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/Bits";
import { Checkout, KycForm } from "@/components/Client";
import { Cover } from "@/components/Ui";
import { RiskLine } from "@/components/Deal";
import Trust from "@/components/Trust";
import { getListing } from "@/lib/q";
import { requireUser } from "@/lib/auth";
import { monnifyMode } from "@/lib/monnify";
import { getSettings, feeCfg } from "@/lib/settings";
import { HORIZON } from "@/lib/deal";
import { naira } from "@/lib/format";
export default async function P({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mode?: string }> }) {
  const { id } = await params; const sp = await searchParams; const l = await getListing(id); if (!l || l.moderation !== "Approved") notFound(); const u = await requireUser();
  const d = l.deal; const open = l.raiseStatus === "OPEN"; const canInv = open && d.canInvest && d.seatsLeft > 0; const canBuy = open && d.canBuy && l.seatsTaken === 0;
  const kind: "invest" | "buy" = sp.mode === "buy" ? (canBuy ? "buy" : "invest") : canInv ? "invest" : "buy";
  const st = await getSettings(); const k = u.kyc?.status;
  const blocked = !u.verified ? <div className="card p-5 text-sm"><b className="text-navy">Verify your email first.</b><p className="text-silver mt-1">Use the banner above to resend the verification email.</p></div>
    : k === "PENDING_REVIEW" || k === "SUBMITTED" ? <div className="card p-5 text-sm"><b className="text-navy">KYC under review.</b><p className="text-silver mt-1">You'll get a reminder as soon as compliance approves your identity.</p></div>
    : k !== "VERIFIED" ? <div className="card p-5"><h2 className="font-bold text-navy mb-1">One-off KYC</h2><p className="text-sm text-silver mb-4">{k === "REJECTED" ? "Your last submission was rejected — please resubmit." : "Required once before investing, buying or withdrawing."}</p><KycForm /></div>
    : l.sellerId === u.id ? <div className="card p-5 text-sm">This is your own listing.</div>
    : !(kind === "invest" ? canInv : canBuy) ? <div className="card p-5 text-sm"><b className="text-navy">Not available.</b><p className="text-silver mt-1">This listing is no longer open for {kind === "invest" ? "co-ownership" : "purchase"}.</p></div> : undefined;
  return (<div className="max-w-xl"><PageHead title={kind === "invest" ? "Invest" : "Buy whole"} sub={kind === "invest" ? "Own Together. Grow Together." : "Pay the seller directly via Kraud"} back={`/property/${l.id}`} />
    <div className="px-4 lg:px-8 space-y-4"><div className="card p-3 flex gap-3"><Cover id={l.id} src={l.img} alt="" className="w-20 h-20 rounded-xl shrink-0" /><div className="min-w-0"><div className="font-semibold truncate">{l.title}</div><div className="text-xs text-silver truncate">{l.estate}, {l.city} · {HORIZON[d.horizon].short}</div><div className="font-bold text-navy mt-1">{kind === "invest" ? <>{naira(d.unit)} <span className="text-xs text-silver">/unit · {d.roiPct}% est.</span></> : naira(l.price)}</div></div></div>
      {canInv && canBuy && <div className="inline-flex rounded-xl bg-navy/[.05] p-1 text-[13px] font-semibold">{(["invest", "buy"] as const).map((m) => <Link key={m} href={`/checkout/${l.id}?mode=${m}`} className={`px-4 h-8 grid place-items-center rounded-lg transition duration-200 ${kind === m ? "tab-on" : "text-silver"}`}>{m === "invest" ? "Invest" : "Buy whole"}</Link>)}</div>}
      <Checkout key={kind} id={l.id} kind={kind} unit={d.unit} seatsLeft={d.seatsLeft} profitPerUnit={d.profitPerUnit} price={l.price} cfg={feeCfg(st, l)} insurer={st.insurer} wallet={Number(u.walletBalance)} blocked={blocked} mode={monnifyMode()} />
      <Trust compact /><RiskLine /></div></div>);
}
