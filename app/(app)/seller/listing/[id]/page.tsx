import { notFound, redirect } from "next/navigation";
import { PageHead } from "@/components/Bits";
import { ListingForm } from "@/components/Client";
import { ActionButton } from "@/components/Ui";
import { prisma } from "@/lib/db";
import { currentUser, requireUser, kycOk } from "@/lib/auth";
import { NG_STATES } from "@/lib/listings";
export default async function E({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await requireUser(); if (u.role !== "SELLER" || !kycOk(u)) redirect("/seller");
  const l = id === "new" ? null : await prisma.listing.findFirst({ where: { id, sellerId: u.id } }); if (id !== "new" && !l) notFound();
  return (<div className="max-w-xl"><PageHead title={l ? "Edit listing" : "New listing"} back="/seller" right={l ? <ActionButton action="listing-delete" body={{ id: l.id }} then="/seller" className="btn-ghost h-9 text-xs" confirm="Delete this listing?">Delete</ActionButton> : undefined} />
    <div className="px-4 lg:px-8 pb-8"><ListingForm l={l ? { ...l, price: Number(l.price) } : undefined} states={NG_STATES} /></div></div>);
}
