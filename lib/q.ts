import type { Listing, User } from "@prisma/client";
import { prisma } from "./db";
export type L = Omit<Listing, "price"> & { price: number; sellerName: string };
export const toL = (l: Listing & { seller: Pick<User, "name" | "businessName"> }): L => ({ ...l, price: Number(l.price), sellerName: l.seller.businessName || l.seller.name });
const inc = { seller: { select: { name: true, businessName: true } } } as const;
export async function listings(where: object = {}) { return (await prisma.listing.findMany({ where: { moderation: "Approved", ...where }, include: inc, orderBy: { createdAt: "desc" } })).map(toL); }
export async function getListing(id: string) { const l = await prisma.listing.findUnique({ where: { id }, include: inc }); return l ? toL(l) : null; }
/** Featured = admin/seed flag OR an active paid placement for that slot. */
export async function featured(slot: string) {
  const now = new Date();
  return (await prisma.listing.findMany({ where: { moderation: "Approved", OR: [{ featured: { has: slot } }, { placements: { some: { slot, status: "ACTIVE", endsAt: { gt: now } } } }] }, include: inc })).map(toL);
}
export async function cities() { const r = await prisma.listing.findMany({ where: { moderation: "Approved" }, distinct: ["city"], select: { city: true }, orderBy: { city: "asc" } }); return ["All", ...r.map((x) => x.city)]; }
