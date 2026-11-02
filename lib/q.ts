import type { Listing, User } from "@prisma/client";
import { prisma } from "./db";
import { deal, type Deal } from "./deal";
type Big = "price" | "totalNeeded" | "unitPrice" | "amountRaised" | "maintenanceCost" | "completionCost" | "estimatedProfit" | "insuranceFee" | "diligenceFee";
/** Serializable listing (no BigInt) + derived deal sheet. Safe to pass to client components. */
export type L = Omit<Listing, Big> & { price: number; insuranceFee: number | null; diligenceFee: number | null; sellerName: string; sellerImg: string | null; deal: Deal };
type Row = Listing & { seller: Pick<User, "name" | "businessName" | "profileImageUrl"> };
export const toL = (l: Row): L => {
  const n = (b: bigint) => Number(b);
  const d = deal({ price: n(l.price), mode: l.commerceMode, horizon: l.horizon, totalNeeded: n(l.totalNeeded), unitPrice: n(l.unitPrice), seatsNeeded: l.seatsNeeded, seatsTaken: l.seatsTaken, amountRaised: n(l.amountRaised), maintenanceCost: n(l.maintenanceCost), completionCost: n(l.completionCost), minProfitMargin: l.minProfitMargin, estimatedProfit: n(l.estimatedProfit), raiseStatus: l.raiseStatus });
  const { price, totalNeeded, unitPrice, amountRaised, maintenanceCost, completionCost, estimatedProfit, insuranceFee, diligenceFee, seller, ...rest } = l;
  void totalNeeded; void unitPrice; void amountRaised; void maintenanceCost; void completionCost; void estimatedProfit;
  return { ...rest, seller, price: n(price), insuranceFee: insuranceFee == null ? null : n(insuranceFee), diligenceFee: diligenceFee == null ? null : n(diligenceFee), sellerName: seller.businessName || seller.name, sellerImg: seller.profileImageUrl, deal: d } as L;
};
const inc = { seller: { select: { name: true, businessName: true, profileImageUrl: true } } } as const;
export async function listings(where: object = {}) { return (await prisma.listing.findMany({ where: { moderation: "Approved", ...where }, include: inc, orderBy: { createdAt: "desc" } })).map(toL); }
export async function getListing(id: string) { const l = await prisma.listing.findUnique({ where: { id }, include: inc }); return l ? toL(l) : null; }
/** Featured = admin/seed flag OR an active paid placement for that slot. */
export async function featured(slot: string) {
  const now = new Date();
  return (await prisma.listing.findMany({ where: { moderation: "Approved", OR: [{ featured: { has: slot } }, { placements: { some: { slot, status: "ACTIVE", endsAt: { gt: now } } } }] }, include: inc })).map(toL);
}
export async function cities() { const r = await prisma.listing.findMany({ where: { moderation: "Approved" }, distinct: ["city"], select: { city: true }, orderBy: { city: "asc" } }); return ["All", ...r.map((x) => x.city)]; }
