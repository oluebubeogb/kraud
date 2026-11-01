import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { confirmByRef } from "@/lib/payments";
/** Monnify redirectUrl target. Never trusts query params: re-verifies the transaction server-to-server. */
export default async function Ret({ searchParams }: { searchParams: Promise<{ ref?: string; paymentReference?: string }> }) {
  const s = await searchParams; const ref = s.ref || s.paymentReference || ""; const u = await requireUser();
  const p = await prisma.payment.findFirst({ where: { ref, userId: u.id } });
  if (!p) return <div className="p-8 text-center text-sm">Payment not found. <Link href="/investments" className="text-teal underline">Portfolio</Link></div>;
  let err = ""; try { await confirmByRef(ref); } catch (e: any) { err = e.message; }
  const after = await prisma.payment.findUnique({ where: { ref } });
  if (after && after.status !== "PENDING" && after.status !== "FAILED") redirect("/receipt/" + ref);
  return (<div className="p-8 max-w-md mx-auto text-center space-y-4"><div className="mx-auto w-10 h-10 rounded-full border-4 border-silver-200 border-t-teal animate-spin" /><h1 className="font-bold text-navy text-lg">Waiting for Monnify confirmation</h1><p className="text-sm text-silver">Bank transfers can take a minute. We'll also confirm automatically via webhook and send your receipt by email.{err && <><br />({err})</>}</p><a href={`/pay/return?ref=${encodeURIComponent(ref)}`} className="btn-primary w-full">Check again</a><Link href="/investments" className="btn-ghost w-full">Back to portfolio</Link></div>);
}
