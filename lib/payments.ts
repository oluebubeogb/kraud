import type { PayKind } from "@prisma/client";
import { prisma, uid } from "./db";
import { initTransaction, verifyTransaction, monnifyMode } from "./monnify";
import { renderReceipt } from "./receipt";
import { sendMail } from "./mail";
import { naira } from "./format";
export const newRef = () => "KRD-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + uid().slice(0, 8).toUpperCase();
export const escrowFee = (amt: number) => Math.min(Math.round(amt * 0.015), 2_000_000);
export async function remind(userId: string, title: string, body: string, dueAt?: Date) { await prisma.reminder.create({ data: { userId, title, body, dueAt } }); }
export async function startPayment(o: { user: { id: string; name: string; email: string }; kind: PayKind; title: string; amount: number; fee?: number; listingId?: string; goalId?: string; placementId?: string }) {
  const ref = newRef(); const fee = o.fee ?? 0;
  const p = await prisma.payment.create({ data: { ref, userId: o.user.id, kind: o.kind, title: o.title, amount: BigInt(o.amount), fee: BigInt(fee), listingId: o.listingId, goalId: o.goalId, placementId: o.placementId, provider: "monnify:" + monnifyMode() } });
  try {
    const t = await initTransaction({ ref, amountNaira: o.amount + fee, name: o.user.name, email: o.user.email, description: `Kraud ${o.kind.toLowerCase()} — ${o.title}` });
    await prisma.payment.update({ where: { id: p.id }, data: { checkoutUrl: t.checkoutUrl, providerRef: t.transactionReference } });
    return { ref, checkoutUrl: t.checkoutUrl };
  } catch (e) { await prisma.payment.update({ where: { id: p.id }, data: { status: "FAILED" } }); throw e; }
}
/** Confirm with Monnify server-side, then finalize. Safe to call many times (redirect + webhook). */
export async function confirmByRef(ref: string) {
  const p = await prisma.payment.findUnique({ where: { ref } }); if (!p) throw new Error("Unknown payment");
  if (p.status !== "PENDING") return p;
  if (!p.providerRef || p.providerRef.startsWith("SIM|")) return p; // simulator confirms via its own route
  const v = await verifyTransaction(p.providerRef); if (!v.paid) return p;
  return finalize(ref, { amountPaid: v.amountPaid, method: v.method, providerRef: p.providerRef });
}
/** Idempotent: only the first caller flips PENDING → HELD/PAID and writes ledger + receipt. */
export async function finalize(ref: string, d: { amountPaid: number; method?: string; providerRef?: string }) {
  const res = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.findUnique({ where: { ref } }); if (!p) throw new Error("Unknown payment");
    const due = Number(p.amount + p.fee); if (d.amountPaid + 0.5 < due) throw new Error(`Underpaid: ${d.amountPaid} < ${due}`);
    const escrow = p.kind === "PURCHASE" || p.kind === "DEPOSIT";
    const flipped = await tx.payment.updateMany({ where: { ref, status: "PENDING" }, data: { status: escrow ? "HELD" : "PAID", paidAt: new Date(), method: d.method || "Monnify" } });
    if (!flipped.count) return null;
    const total = p.amount + p.fee;
    const L = (account: string, amount: bigint, memo: string) => ({ paymentId: p.id, account, amount, memo });
    const entries = [L("MONNIFY_CLEARING", -total, "Collected via Monnify")];
    if (escrow) entries.push(L("ESCROW_HELD", p.amount, "Held pending diligence"), L("PLATFORM_FEE", p.fee, "Escrow fee"));
    if (p.kind === "SAVINGS_TOPUP") { entries.push(L("SAVINGS_LIABILITY", p.amount, "Target savings top-up")); if (p.goalId) await tx.goal.update({ where: { id: p.goalId }, data: { saved: { increment: p.amount } } }); }
    if (p.kind === "PLACEMENT") { entries.push(L("PLACEMENT_REVENUE", p.amount, "Featured placement")); if (p.placementId) { const pl = await tx.placement.findUnique({ where: { id: p.placementId } }); if (pl) await tx.placement.update({ where: { id: pl.id }, data: { status: "ACTIVE", startsAt: new Date(), endsAt: new Date(Date.now() + pl.days * 864e5) } }); } }
    await tx.ledgerEntry.createMany({ data: entries });
    return tx.payment.findUnique({ where: { ref }, include: { user: true } });
  });
  if (!res) return prisma.payment.findUnique({ where: { ref } });
  const file = await renderReceipt({ ref, title: res.title, buyer: res.user.name, email: res.user.email, kind: res.kind, method: res.method || "Monnify", amount: Number(res.amount), fee: Number(res.fee), status: res.status === "HELD" ? "Paid — held in escrow" : "Paid", paidAt: res.paidAt!, providerRef: res.providerRef });
  await prisma.payment.update({ where: { ref }, data: { receiptPath: file } });
  const escrow = res.status === "HELD";
  await remind(res.userId, "Payment received — " + ref, `${naira(Number(res.amount))} ${escrow ? "held in escrow for" : "for"} ${res.title}.${escrow ? " We'll remind you about inspection in 7 days." : ""}`);
  if (escrow) await remind(res.userId, "Inspection & escrow check", `Inspect ${res.title} and confirm handover so escrow can be released.`, new Date(Date.now() + 7 * 864e5));
  try { await sendMail(res.user.email, `Kraud receipt ${ref}`, `Payment confirmed.\n\n${res.title}\nAmount: ${naira(Number(res.amount + res.fee))}\nReference: ${ref}\n\nYour PDF receipt is attached.`, [{ filename: `kraud-${ref}.pdf`, path: file }]); } catch (e) { console.error("receipt mail failed", e); }
  return res;
}
