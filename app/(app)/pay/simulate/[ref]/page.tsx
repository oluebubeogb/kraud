import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { simulatorOn } from "@/lib/monnify";
import { SimulatePay } from "@/components/Client";
export default async function Sim({ params }: { params: Promise<{ ref: string }> }) {
  if (!simulatorOn()) notFound(); const { ref } = await params; const u = await requireUser();
  const p = await prisma.payment.findFirst({ where: { ref, userId: u.id, status: "PENDING" } }); if (!p) notFound();
  return <div className="min-h-[80vh] grid place-items-center p-4"><SimulatePay reference={p.ref} amount={Number(p.amount + p.fee)} title={p.title} /></div>;
}
