import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { Cover } from "@/components/Ui";
import { load } from "@/lib/db";
import { currentUser } from "@/lib/auth";
export default async function C() {
  const u = (await currentUser())!; const db = load(); const th = db.threads.filter((t) => t.buyer === u.id);
  return (<div><PageHead title="Messages" sub="Private 1-on-1 with sellers · no group chats" />
    <div className="px-4 lg:px-8">{th.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No conversations yet. Tap the chat icon on any listing.</div> :
    <div className="card divide-y divide-silver-200">{th.map((t) => { const l = db.listings.find((x) => x.id === t.listingId); const last = t.msgs[t.msgs.length - 1]; return (
      <Link key={t.id} href={`/chat/${t.id}`} className="flex gap-3 p-3 hover:bg-paper"><Cover id={t.listingId} src={l?.img || ""} alt="" className="w-12 h-12 rounded-full shrink-0" /><div className="min-w-0 flex-1"><div className="flex justify-between"><b className="text-navy text-sm">{t.sellerName}</b><span className="text-[11px] text-silver">{new Date(last.at).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" })}</span></div><div className="text-xs text-silver truncate">{l?.title}</div><div className="text-sm truncate">{last.text}</div></div></Link>); })}</div>}</div></div>);
}
