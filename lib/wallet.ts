import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
type Tx = Prisma.TransactionClient;
/** Credit/debit the in-app wallet atomically, with history. Debit fails if balance is short. */
export async function walletMove(tx: Tx, userId: string, amount: bigint, kind: string, memo: string) {
  if (amount < 0n) { const r = await tx.user.updateMany({ where: { id: userId, walletBalance: { gte: -amount } }, data: { walletBalance: { increment: amount } } }); if (!r.count) throw new Error("Wallet balance is too low"); }
  else await tx.user.update({ where: { id: userId }, data: { walletBalance: { increment: amount } } });
  await tx.walletTx.create({ data: { userId, amount, kind, memo } });
}
export const credit = (userId: string, amount: bigint, kind: string, memo: string) => prisma.$transaction((tx) => walletMove(tx, userId, amount, kind, memo));
/** Accrue simple interest on a vault up to now. */
export async function accrueVault(tx: Tx, id: string) {
  const v = await tx.savingsVault.findUnique({ where: { id } }); if (!v || v.status !== "ACTIVE") return v;
  const until = new Date(Math.min(Date.now(), v.lockedUntil.getTime()));
  const days = (until.getTime() - v.accruedAt.getTime()) / 864e5; if (days <= 0) return v;
  const add = BigInt(Math.floor((Number(v.balance) * v.ratePct * days) / 36500));
  return tx.savingsVault.update({ where: { id }, data: { interest: { increment: add }, accruedAt: until } });
}
export function referralCode(username: string) { return (username.replace(/[^a-z0-9]/gi, "").slice(0, 6) + Math.random().toString(36).slice(2, 6)).toUpperCase(); }
