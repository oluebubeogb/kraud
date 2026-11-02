import { notFound } from "next/navigation";
import { PageHead, ListingCard } from "@/components/Bits";
import { Avatar } from "@/components/Deal";
import { prisma } from "@/lib/db";
import { listings } from "@/lib/q";
export default async function U({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const s = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, businessName: true, profileImageUrl: true, role: true } }); if (!s) notFound();
  const ls = await listings({ sellerId: s.id }); const name = s.businessName || s.name;
  return (<div><PageHead title={name} back="/chat" right={<Avatar src={s.profileImageUrl} name={name} size={40} />} />
    <div className="px-4 lg:px-8 space-y-3"><h2 className="font-semibold text-navy">{ls.length} {ls.length === 1 ? "property" : "properties"}</h2>
      {ls.length === 0 ? <div className="card p-6 text-center text-sm text-silver">No live listings.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{ls.map((l, i) => <ListingCard key={l.id} l={l} i={i} />)}</div>}</div></div>);
}
