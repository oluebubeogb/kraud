import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { KycForm, AvatarUpload, CopyCode } from "@/components/Client";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { referralCode } from "@/lib/wallet";
import { naira } from "@/lib/format";
import { ActionButton } from "@/components/Ui";
import { currentUser, requireUser, isAdmin } from "@/lib/auth";
import { wat } from "@/lib/format";
const KS: Record<string, string> = { VERIFIED: "Verified", PENDING_REVIEW: "Under review", SUBMITTED: "Submitted", REJECTED: "Rejected — resubmit", NOT_STARTED: "Not started" };
export default async function P() {
  const u0 = await requireUser(); const u = u0.referralCode ? u0 : { ...u0, referralCode: (await prisma.user.update({ where: { id: u0.id }, data: { referralCode: referralCode(u0.username) } })).referralCode }; const k = u.kyc; const st = await getSettings();
  const refs = await prisma.referral.findMany({ where: { referrerId: u.id }, include: { referee: { select: { name: true } } }, orderBy: { createdAt: "desc" } }); const earned = refs.filter((r) => r.status === "CREDITED").reduce((a, r) => a + Number(r.reward), 0);
  return (<div><PageHead title="Profile" />
    <div className="px-4 lg:px-8 space-y-4 max-w-xl">
      <div className="card p-4 space-y-4 k-hero"><AvatarUpload src={u.profileImageUrl} name={u.name} required={u.role === "SELLER"} /><div className="min-w-0"><div className="font-bold text-navy">{u.name}{u.businessName && <span className="text-silver font-normal"> · {u.businessName}</span>}</div><div className="text-sm text-silver truncate">@{u.username} · {u.email}</div><div className="flex flex-wrap gap-1.5 mt-1"><span className={`chip ${u.verified ? "bg-teal-50 text-teal" : "bg-silver-200 text-navy"}`}>{u.verified ? "Email verified" : "Email unverified"}</span><span className="chip bg-navy-50 text-navy">{u.role === "SELLER" ? "Seller" : "Buyer"}</span>{isAdmin(u) && <span className="chip bg-navy text-white">Admin</span>}</div></div></div>
      <div id="invite" className="rounded-3xl wash-coral p-4 space-y-3 scroll-mt-20"><div className="flex items-center gap-2"><Icon n="gift" /><h2 className="font-bold text-navy">Invite &amp; Earn</h2><span className="ml-auto chip bg-white/70">{naira(earned)} earned</span></div>
        <p className="text-sm">Get {naira(st["referral:reward"])} in your wallet when a friend you invite makes their first investment or purchase.</p>
        {u.referralCode && <CopyCode code={u.referralCode} link={`${appUrl()}/signup?ref=${u.referralCode}`} />}
        {refs.length > 0 && <div className="text-xs space-y-1">{refs.map((r) => <div key={r.id} className="flex justify-between"><span>{r.referee.name}</span><span>{r.status === "CREDITED" ? `+${naira(Number(r.reward))}` : "Pending first deal"}</span></div>)}</div>}</div>
      <Link href="/savings" className="card p-4 flex items-center gap-3 hover:shadow-card"><span className="w-10 h-10 rounded-xl wash-mint grid place-items-center"><Icon n="wallet" /></span><div className="flex-1"><div className="text-xs text-silver">Wallet</div><b className="text-navy">{naira(Number(u.walletBalance))}</b></div><Icon n="arrow" className="w-4 h-4 text-silver" /></Link>
      <div className="card p-4"><div className="flex items-center gap-2 mb-3"><Icon n="shield" className="text-teal" /><h2 className="font-bold text-navy">Identity (KYC)</h2>{k && <span className={`ml-auto chip ${k.status === "VERIFIED" ? "bg-teal-50 text-teal" : "bg-silver-200 text-navy"}`}>{KS[k.status]}</span>}</div>
        {k && k.status !== "REJECTED" ? <div className="text-sm space-y-1"><div>{k.legalName}</div><div>NIN {k.ninMasked} · BVN {k.bvnMasked}</div><div className="text-xs text-silver">Submitted {wat(k.submittedAt)}{k.decidedAt ? ` · decided ${wat(k.decidedAt)}` : ""} — one-off, never asked again.</div></div> : u.verified ? <KycForm /> : <p className="text-sm text-silver">Verify your email first.</p>}</div>
      {u.role === "BUYER" && <div className="card p-4 flex items-center gap-3"><div className="flex-1"><b className="text-navy">Sell on Kraud</b><p className="text-xs text-silver">List properties for co-ownership or sale, chat with buyers, book Featured placements.</p></div><ActionButton action="become-seller" body={{}} then="/seller" className="btn-teal h-10">Become a seller</ActionButton></div>}
      <div className="card divide-y divide-silver-200">{[...(u.role === "SELLER" ? [["/seller", "grid", "Seller dashboard"]] : []), ["/reminders", "bell", "Reminders"], ["/investments", "receipt", "Receipts"], ...(isAdmin(u) ? [["/admin", "shield", "Admin console"]] : [])].map(([h, i, t]) => <Link key={h} href={h} className="flex items-center gap-3 p-4 hover:bg-paper text-navy"><Icon n={i} />{t}<Icon n="arrow" className="ml-auto w-4 h-4 text-silver" /></Link>)}</div>
      <ActionButton action="logout" then="/login" className="btn-ghost w-full"><Icon n="logout" className="w-4 h-4" />Sign out</ActionButton></div></div>);
}
