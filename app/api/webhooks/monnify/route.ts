import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validSignature } from "@/lib/monnify";
import { confirmByRef } from "@/lib/payments";
/** Monnify webhook: verify HMAC-SHA512 signature, store event once (idempotent), then re-verify server-side and finalize. */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("monnify-signature"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const body = JSON.parse(raw); const d = body.eventData || {};
  const key = `${body.eventType}:${d.transactionReference || d.reference || d.paymentReference}`;
  try { await prisma.webhookEvent.create({ data: { provider: "monnify", eventKey: key, payload: body } }); } catch { return NextResponse.json({ ok: true, duplicate: true }); }
  if (body.eventType === "SUCCESSFUL_TRANSACTION" && d.paymentReference) { try { await confirmByRef(d.paymentReference); } catch (e) { console.error("webhook confirm", e); } }
  if (body.eventType === "SUCCESSFUL_DISBURSEMENT" || body.eventType === "FAILED_DISBURSEMENT") await prisma.withdrawal.updateMany({ where: { providerRef: d.reference }, data: { status: body.eventType === "SUCCESSFUL_DISBURSEMENT" ? "PAID" : "FAILED" } });
  return NextResponse.json({ ok: true });
}
