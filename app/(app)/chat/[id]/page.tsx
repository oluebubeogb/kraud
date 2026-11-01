import { notFound } from "next/navigation";
import { PageHead } from "@/components/Bits";
import { ChatBox } from "@/components/Client";
import { load } from "@/lib/db";
import { currentUser } from "@/lib/auth";
export default async function T({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = (await currentUser())!; const db = load(); const t = db.threads.find((x) => x.id === id && x.buyer === u.id); if (!t) notFound();
  const l = db.listings.find((x) => x.id === t.listingId);
  return (<div><PageHead title={t.sellerName} sub={`Verified seller · ${l?.title ?? ""}`} back="/chat" /><ChatBox id={t.id} me={u.id} msgs={t.msgs} /></div>);
}
