import type { PayKind } from "@prisma/client";
import { prisma, uid } from "./db";
import { initTransaction, verifyTransaction, monnifyMode } from "./monnify";
import { renderReceipt } from "./receipt";
import { sendMail } from "./mail";
import { naira } from "./format";
import { walletMove } from "./wallet";
import { getSettings } from "./settings";
import { HORIZON } from "./deal";
export const newRef = () => "KRD-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + uid().slice(0, 8).toUpperCase();
export async function remind(userId: string, title: string, body: string, dueAt?: Date) { await prisma.reminder.create({ data: { userId, title, body, dueAt } }); }
type Start = { user: { id: string; name: string; email: string }; kind: PayKind; title: string; amount: number; fee?: number; listingId?: string; goalId?: string; vaultId?: string; units?: number; placementId?: string; method?: "monnify" | "wallet" };
/** Monnify checkout, or instant settlement from the in-app wallet. */
export async function startPayment(o: Start) {
  const ref = newRef(); const fee = o.fee ?? 0; const wallet = o.method === "wallet";
  if (wallet && o.kind === "WALLET_TOPUP") throw new Error("Top up the wallet with Monnify");
  const base = { ref, userId: o.user.id, kind: o.kind, title: o.title, amount: BigInt(o.amount), fee: BigInt(fee), listingId: o.listingId, goalId: o.goalId, vaultId: o.vaultId, units: o.units, placementId: o.placementId };
  if (wallet) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({ data: { ...base, provider: "wallet" } });
      await walletMove(tx, o.user.id, -BigInt(o.amount + fee), "PAYMENT", `${o.title} (${ref})`);
    });
    await finalize(ref, { amountPaid: o.amount + fee, method: "Wallet" });
    return { ref, checkoutUrl: `/receipt/${ref}` };
  }
  const p = await prisma.payment.create({ data: { ...base, provider: "monnify:" + monnifyMode() } });
  try {
    const t = await initTransaction({ ref, amountNaira: o.amount + fee, name: o.user.name, email: o.user.email, description: `Kraud ${o.kind.toLowerCase().replace("_", " ")} — ${o.title}` });
    await prisma.payment.update({ where: { id: p.id }, data: { checkoutUrl: t.checkoutUrl, providerRef: t.transactionReference } });
    return { ref, checkoutUrl: t.checkoutUrl };
  } catch (e) { await prisma.payment.update({ where: { id: p.id }, data: { status: "FAILED" } }); throw e; }
}
/** Confirm with Monnify server-side, then finalize. Safe to call many times (redirect + webhook). */
export async function confirmByRef(ref: string) {
  const p = await prisma.payment.findUnique({ where: { ref } }); if (!p) throw new Error("Unknown payment");
  if (p.status !== "PENDING") return p;
  if (!p.providerRef || p.providerRef.startsWith("SIM|")) return p;
  const v = await verifyTransaction(p.providerRef); if (!v.paid) return p;
  return finalize(ref, { amountPaid: v.amountPaid, method: v.method, providerRef: p.providerRef });
}
const KIND_LABEL: Partial<Record<PayKind, string>> = { INVEST: "Co-own units", PURCHASE: "Whole-property purchase", DEPOSIT: "Deposit", SAVINGS_TOPUP: "Listing savings", VAULT_TOPUP: "Savings vault", WALLET_TOPUP: "Wallet top-up", PLACEMENT: "Featured placement" };
/**
 * Idempotent: the first caller flips PENDING → PAID and applies effects.
 * INVEST → raise pool + holding; PURCHASE → direct settlement to seller; top-ups credit balances.
 * An investment that lands after the raise filled is refunded to the wallet (status REFUNDED).
 */
export async function finalize(ref: string, d: { amountPaid: number; method?: string; providerRef?: string }) {
  const s = await getSettings();
  const res = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.findUnique({ where: { ref } }); if (!p) throw new Error("Unknown payment");
    const due = Number(p.amount + p.fee); if (d.amountPaid + 0.5 < due) throw new Error(`Underpaid: ${d.amountPaid} < ${due}`);
    const method = d.method || "Monnify"; const viaWallet = method === "Wallet";
    const flipped = await tx.payment.updateMany({ where: { ref, status: "PENDING" }, data: { status: "PAID", paidAt: new Date(), method } });
    if (!flipped.count) return null;
    const total = p.amount + p.fee;
    const L = (account: string, amount: bigint, memo: string) => ({ paymentId: p.id, account, amount, memo });
    const entries = [L(viaWallet ? "WALLET_LIABILITY" : "MONNIFY_CLEARING", -total, viaWallet ? "Paid from Kraud wallet" : "Collected via Monnify")];
    let note = "";
    if (p.kind === "INVEST" && p.listingId) {
      const l = await tx.listing.findUnique({ where: { id: p.listingId } });
      const units = p.units || 1;
      const ok = l && l.raiseStatus === "OPEN" && l.seatsTaken + units <= l.seatsNeeded;
      if (!ok) {
        await tx.payment.update({ where: { ref }, data: { status: "REFUNDED" } });
        await walletMove(tx, p.userId, total, "REFUND", `Raise full — refund for ${ref}`);
        entries.push(L("WALLET_LIABILITY", total, "Raise full: refunded to wallet"));
        note = "This raise filled before your payment landed, so the full amount is back in your Kraud wallet.";
      } else {
        const seatsTaken = l.seatsTaken + units; const funded = seatsTaken >= l.seatsNeeded;
        await tx.listing.update({ where: { id: l.id }, data: { seatsTaken, amountRaised: { increment: p.amount }, raiseStatus: funded ? "FUNDED" : "OPEN" } });
        const profitPerUnit = l.seatsNeeded ? Number(l.estimatedProfit || BigInt(Math.round(Number(l.totalNeeded) * l.minProfitMargin / 100))) / l.seatsNeeded : 0;
        await tx.investmentUnit.create({ data: { userId: p.userId, listingId: l.id, paymentRef: ref, units, invested: p.amount, fees: p.fee, expectedProfit: BigInt(Math.floor(profitPerUnit * units)), maturesAt: new Date(Date.now() + HORIZON[l.horizon].months * 30.4 * 864e5) } });
        entries.push(L("RAISE_POOL", p.amount, `Raise pool · ${units} unit(s)`), L("INSURANCE_FEES", p.fee, "Insurance + due diligence"));
        note = funded ? "This raise is now fully funded." : "";
      }
    }
    if (p.kind === "PURCHASE" || p.kind === "DEPOSIT") {
      entries.push(L("SELLER_PAYABLE", p.amount, "Direct settlement to seller"), L("PLATFORM_FEE", p.fee, "Due diligence fee"));
      if (p.kind === "PURCHASE" && p.listingId) await tx.listing.update({ where: { id: p.listingId }, data: { raiseStatus: "SOLD" } });
    }
    if (p.kind === "SAVINGS_TOPUP") { entries.push(L("SAVINGS_LIABILITY", p.amount, "Listing savings top-up")); if (p.goalId) await tx.goal.update({ where: { id: p.goalId }, data: { saved: { increment: p.amount } } }); }
    if (p.kind === "VAULT_TOPUP" && p.vaultId) {
      const { accrueVault } = await import("./wallet"); await accrueVault(tx, p.vaultId);
      await tx.savingsVault.update({ where: { id: p.vaultId }, data: { balance: { increment: p.amount } } });
      entries.push(L("VAULT_LIABILITY", p.amount, "Savings vault top-up"));
    }
    if (p.kind === "WALLET_TOPUP") { await walletMove(tx, p.userId, p.amount, "TOPUP", `Top-up ${ref}`); entries.push(L("WALLET_LIABILITY", p.amount, "Wallet top-up")); }
    if (p.kind === "PLACEMENT") { entries.push(L("PLACEMENT_REVENUE", p.amount, "Featured placement")); if (p.placementId) { const pl = await tx.placement.findUnique({ where: { id: p.placementId } }); if (pl) await tx.placement.update({ where: { id: pl.id }, data: { status: "ACTIVE", startsAt: new Date(), endsAt: new Date(Date.now() + pl.days * 864e5) } }); } }
    await tx.ledgerEntry.createMany({ data: entries });
    // Invite & Earn: first co-own or purchase credits the referrer.
    if ((p.kind === "INVEST" || p.kind === "PURCHASE") && note.indexOf("refund") < 0) {
      const r = await tx.referral.findUnique({ where: { refereeId: p.userId } });
      if (r && r.status === "PENDING" && s["referral:reward"] > 0) {
        const amt = BigInt(Math.round(s["referral:reward"]));
        await tx.referral.update({ where: { id: r.id }, data: { status: "CREDITED", reward: amt, creditedAt: new Date() } });
        await walletMove(tx, r.referrerId, amt, "REFERRAL", "Invite & Earn reward");
        await tx.reminder.create({ data: { userId: r.referrerId, title: "You earned " + naira(Number(amt)), body: "A friend you invited just made their first move on Kraud. The reward is in your wallet." } });
      }
    }
    const out = await tx.payment.findUnique({ where: { ref }, include: { user: true } });
    return out ? { ...out, note } : null;
  });
  if (!res) return prisma.payment.findUnique({ where: { ref } });
  const label = KIND_LABEL[res.kind] || res.kind;
  const statusText = res.status === "REFUNDED" ? "Refunded to wallet" : res.kind === "INVEST" ? "Paid — added to raise pool" : res.kind === "PURCHASE" ? "Paid — settled to seller" : "Paid";
  const file = await renderReceipt({ ref, title: res.title, buyer: res.user.name, email: res.user.email, kind: label, method: res.method || "Monnify", amount: Number(res.amount), fee: Number(res.fee), status: statusText, paidAt: res.paidAt!, providerRef: res.providerRef, units: res.units ?? undefined });
  await prisma.payment.update({ where: { ref }, data: { receiptPath: file } });
  await remind(res.userId, "Payment received — " + ref, `${naira(Number(res.amount + res.fee))} · ${label} · ${res.title}. ${res.note}`.trim());
  if (res.kind === "PURCHASE") await remind(res.userId, "Arrange handover", `Chat with the seller to schedule inspection and handover of ${res.title}.`, new Date(Date.now() + 3 * 864e5));
  try { await sendMail(res.user.email, `Kraud receipt ${ref}`, `Payment confirmed.\n\n${label}: ${res.title}\nAmount: ${naira(Number(res.amount + res.fee))}\nStatus: ${statusText}\nReference: ${ref}\n${res.note ? "\n" + res.note + "\n" : ""}\nYour PDF receipt is attached.`, [{ filename: `kraud-${ref}.pdf`, path: file }]); } catch (e) { console.error("receipt mail failed", e); }
  return res;
}
