import { prisma, isProd } from "./db";
import { encrypt } from "./secure";
import { bvnMatch, monnifyOn, ninLookup } from "./monnify";
/**
 * One-off KYC status machine: NOT_STARTED → SUBMITTED → VERIFIED | PENDING_REVIEW → VERIFIED | REJECTED.
 * KYC_PROVIDER: "monnify" (NIN + BVN match via Monnify VAS), "manual" (admin reviews), "sandbox" (auto-approve, non-production only).
 */
export const kycProvider = () => process.env.KYC_PROVIDER || (isProd() ? "manual" : "sandbox");
export type KycInput = { legalName: string; dob: string; phone: string; nin: string; bvn: string };
type Decision = { status: "VERIFIED" | "PENDING_REVIEW" | "REJECTED"; note?: string; ref?: string };
interface Provider { check(i: KycInput): Promise<Decision> }
const providers: Record<string, Provider> = {
  sandbox: { async check() { if (isProd()) return { status: "PENDING_REVIEW", note: "Sandbox provider disabled in production" }; return { status: "VERIFIED", note: "Sandbox auto-approval" }; } },
  manual: { async check() { return { status: "PENDING_REVIEW", note: "Awaiting compliance review" }; } },
  monnify: { async check(i) {
    if (!monnifyOn()) return { status: "PENDING_REVIEW", note: "Monnify keys missing — queued for manual review" };
    try {
      const n: any = await ninLookup(i.nin);
      const b: any = await bvnMatch({ bvn: i.bvn, name: i.legalName, dateOfBirth: i.dob, mobileNo: i.phone });
      const nameOk = b?.name?.matchStatus === "FULL_MATCH" || b?.name?.matchStatus === "PARTIAL_MATCH";
      const dobOk = b?.dateOfBirth === "FULL_MATCH" || b?.dateOfBirth?.matchStatus === "FULL_MATCH";
      const ninName = `${n?.firstName ?? ""} ${n?.lastName ?? ""}`.toLowerCase();
      const ninOk = !!n && i.legalName.toLowerCase().split(/\s+/).some((w) => w.length > 1 && ninName.includes(w));
      if (nameOk && dobOk && ninOk) return { status: "VERIFIED", note: "NIN + BVN matched via Monnify" };
      return { status: "PENDING_REVIEW", note: `Partial match (name:${nameOk} dob:${dobOk} nin:${ninOk})` };
    } catch (e: any) { return { status: "PENDING_REVIEW", note: "Provider error: " + e.message }; }
  } },
};
export async function submitKyc(userId: string, i: KycInput) {
  const existing = await prisma.kyc.findUnique({ where: { userId } });
  if (existing && ["VERIFIED", "PENDING_REVIEW", "SUBMITTED"].includes(existing.status)) throw new Error("KYC is one-off and already on file");
  const p = kycProvider();
  const base = { legalName: i.legalName, dob: i.dob, phone: i.phone, ninMasked: "*******" + i.nin.slice(-4), bvnMasked: "*******" + i.bvn.slice(-4), ninEnc: encrypt(i.nin), bvnEnc: encrypt(i.bvn), provider: p, status: "SUBMITTED" as const, submittedAt: new Date(), note: null, decidedAt: null };
  await prisma.kyc.upsert({ where: { userId }, create: { userId, ...base }, update: base });
  const d = await (providers[p] || providers.manual).check(i);
  return prisma.kyc.update({ where: { userId }, data: { status: d.status, note: d.note, providerRef: d.ref, decidedAt: d.status === "PENDING_REVIEW" ? null : new Date(), decidedBy: d.status === "PENDING_REVIEW" ? null : p } });
}
