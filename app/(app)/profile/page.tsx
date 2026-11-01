import Link from "next/link";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { KycForm } from "@/components/Client";
import { ActionButton } from "@/components/Ui";
import { currentUser, isAdmin } from "@/lib/auth";
import { wat } from "@/lib/format";
export default async function P() {
  const u = (await currentUser())!;
  return (<div><PageHead title="Profile" />
    <div className="px-4 lg:px-8 space-y-4 max-w-xl">
      <div className="card p-4 flex items-center gap-3"><div className="w-14 h-14 rounded-full bg-navy text-white grid place-items-center text-xl font-bold">{u.name[0]?.toUpperCase()}</div><div className="min-w-0"><div className="font-bold text-navy">{u.name}</div><div className="text-sm text-silver truncate">@{u.username} · {u.email}</div><div className="flex gap-1.5 mt-1"><span className={`chip ${u.verified ? "bg-teal-50 text-teal" : "bg-silver-200 text-navy"}`}>{u.verified ? "Email verified" : "Email unverified"}</span>{isAdmin(u) && <span className="chip bg-navy text-white">Admin</span>}</div></div></div>
      <div className="card p-4"><div className="flex items-center gap-2 mb-3"><Icon n="shield" className="text-teal" /><h2 className="font-bold text-navy">Identity (KYC)</h2></div>
        {u.kyc ? <div className="text-sm space-y-1"><span className="chip bg-teal-50 text-teal">Verified</span><div>NIN {u.kyc.nin} · BVN {u.kyc.bvn}</div><div className="text-xs text-silver">Completed {wat(u.kyc.at)} — one-off, never asked again.</div></div> : <KycForm />}</div>
      <div className="card divide-y divide-silver-200">{[["/reminders", "bell", "Reminders"], ["/investments", "receipt", "Receipts"], ...(isAdmin(u) ? [["/admin", "grid", "Admin console"]] : [])].map(([h, i, t]) => <Link key={h} href={h} className="flex items-center gap-3 p-4 hover:bg-paper text-navy"><Icon n={i} />{t}<Icon n="arrow" className="ml-auto w-4 h-4 text-silver" /></Link>)}</div>
      <ActionButton action="logout" then="/login" className="btn-ghost w-full"><Icon n="logout" className="w-4 h-4" />Sign out</ActionButton></div></div>);
}
