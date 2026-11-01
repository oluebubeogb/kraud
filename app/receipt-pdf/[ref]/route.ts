import fs from "fs";
import { prisma } from "@/lib/db";
import { currentUser, isAdmin } from "@/lib/auth";
import { RECEIPT_DIR, renderReceipt } from "@/lib/receipt";
export async function GET(_: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params; const u = await currentUser(); if (!u) return new Response("Sign in", { status: 401 });
  const p = await prisma.payment.findUnique({ where: { ref }, include: { user: true } });
  if (!p || (p.userId !== u.id && !isAdmin(u)) || !p.paidAt) return new Response("Not found", { status: 404 });
  let file = p.receiptPath;
  if (!file || !file.startsWith(RECEIPT_DIR) || !fs.existsSync(file)) { file = await renderReceipt({ ref, title: p.title, buyer: p.user.name, email: p.user.email, kind: p.kind, method: p.method || "Monnify", amount: Number(p.amount), fee: Number(p.fee), status: p.status === "HELD" ? "Paid — held in escrow" : p.status === "RELEASED" ? "Paid — released to seller" : p.status === "REFUNDED" ? "Refunded" : "Paid", paidAt: p.paidAt, providerRef: p.providerRef }); await prisma.payment.update({ where: { ref }, data: { receiptPath: file } }); }
  return new Response(fs.readFileSync(file), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="kraud-${ref}.pdf"`, "cache-control": "private, no-store" } });
}
