import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { KycForm } from "@/components/Client";
import { ActionButton } from "@/components/Ui";
import { currentUser, requireUser, isAdmin } from "@/lib/auth";
import { wat } from "@/lib/format";
const KS: Record<string, string> = { VERIFIED: "Verified", PENDING_REVIEW: "Under review", SUBMITTED: "Submitted", REJECTED: "Rejected — resubmit", NOT_STARTED: "Not started" };
export default async function P() {
  const u = await requireUser(); const k = u.kyc;
  return (<div><PageHead title="Profile" />
    <div className="px-4 lg:px-8 space-y-4 max-w-xl">
      <div className="card p-4 flex items-center gap-3"><div className="w-14 h-14 rounded-full bg-navy text-white grid place-items-center text-xl font-bold">{u.name[0]?.toUpperCase()}</div><div className="min-w-0"><div className="font-bold text-navy">{u.name}{u.businessName && <span className="text-silver font-normal"> · {u.businessName}</span>}</div><div className="text-sm text-silver truncate">@{u.username} · {u.email}</div><div className="flex flex-wrap gap-1.5 mt-1"><span className={`chip ${u.verified ? "bg-teal-50 text-teal" : "bg-silver-200 text-navy"}`}>{u.verified ? "Email verified" : "Email unverified"}</span><span className="chip bg-navy-50 text-navy">{u.role === "SELLER" ? "Seller" : "Buyer"}</span>{isAdmin(u) && <span className="chip bg-navy text-white">Admin</span>}</div></div></div>
      <div className="card p-4"><div className="flex items-center gap-2 mb-3"><Icon n="shield" className="text-teal" /><h2 className="font-bold text-navy">Identity (KYC)</h2>{k && <span className={`ml-auto chip ${k.status === "VERIFIED" ? "bg-teal-50 text-teal" : "bg-silver-200 text-navy"}`}>{KS[k.status]}</span>}</div>
        {k && k.status !== "REJECTED" ? <div className="text-sm space-y-1"><div>{k.legalName}</div><div>NIN {k.ninMasked} · BVN {k.bvnMasked}</div><div className="text-xs text-silver">Submitted {wat(k.submittedAt)}{k.decidedAt ? ` · decided ${wat(k.decidedAt)}` : ""} — one-off, never asked again.</div></div> : u.verified ? <KycForm /> : <p className="text-sm text-silver">Verify your email first.</p>}</div>
      {u.role === "BUYER" && <div className="card p-4 flex items-center gap-3"><div className="flex-1"><b className="text-navy">Sell on Kraud</b><p className="text-xs text-silver">List properties, reply to buyers, book Featured placements.</p></div><ActionButton action="become-seller" body={{}} then="/seller" className="btn-teal h-10">Become a seller</ActionButton></div>}
      <div className="card divide-y divide-silver-200">{[...(u.role === "SELLER" ? [["/seller", "grid", "Seller dashboard"]] : []), ["/reminders", "bell", "Reminders"], ["/investments", "receipt", "Receipts"], ...(isAdmin(u) ? [["/admin", "shield", "Admin console"]] : [])].map(([h, i, t]) => <Link key={h} href={h} className="flex items-center gap-3 p-4 hover:bg-paper text-navy"><Icon n={i} />{t}<Icon n="arrow" className="ml-auto w-4 h-4 text-silver" /></Link>)}</div>
      <ActionButton action="logout" then="/login" className="btn-ghost w-full"><Icon n="logout" className="w-4 h-4" />Sign out</ActionButton></div></div>);
}
