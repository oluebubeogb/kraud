import crypto from "crypto";
import { appUrl, isProd } from "./db";
/** Monnify gateway. MONNIFY_ENV=sandbox|live. If keys are missing outside production, the built-in sandbox simulator is used. */
/** PAYMENT_PROVIDER=monnify (default) | bannk. Bannk Dev Mode speaks the Monnify API, so both use the same MONNIFY_* vars;
 *  with bannk, MONNIFY_BASE_URL must point at the Bannk public URL and the keys come from Bannk Dev Mode → API keys. */
export const paymentProvider = () => ((process.env.PAYMENT_PROVIDER || "monnify").toLowerCase() === "bannk" ? "bannk" : "monnify");
export const monnifyBase = () => {
  const b = (process.env.MONNIFY_BASE_URL || "").replace(/\/+$/, "");
  if (paymentProvider() === "bannk") { if (!b) throw new Error("PAYMENT_PROVIDER=bannk requires MONNIFY_BASE_URL (your Bannk public URL)"); return b; }
  return b || (process.env.MONNIFY_ENV === "live" ? "https://api.monnify.com" : "https://sandbox.monnify.com");
};
export const monnifyOn = () => !!(process.env.MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY && process.env.MONNIFY_CONTRACT_CODE && (paymentProvider() !== "bannk" || process.env.MONNIFY_BASE_URL));
export const simulatorOn = () => !monnifyOn() && !isProd();
export const monnifyMode = () => (monnifyOn() ? (paymentProvider() === "bannk" ? "bannk" : process.env.MONNIFY_ENV === "live" ? "live" : "sandbox") : simulatorOn() ? "simulator" : "unconfigured");
let tok: { v: string; exp: number } | null = null;
async function token() {
  if (tok && tok.exp > Date.now()) return tok.v;
  const r = await fetch(monnifyBase() + "/api/v1/auth/login", { method: "POST", headers: { Authorization: "Basic " + Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString("base64") } });
  const d = await r.json(); if (!d.requestSuccessful) throw new Error("Monnify auth failed: " + (d.responseMessage || r.status));
  tok = { v: d.responseBody.accessToken, exp: Date.now() + (d.responseBody.expiresIn - 60) * 1000 }; return tok.v;
}
async function call(path: string, init: RequestInit = {}) {
  const r = await fetch(monnifyBase() + path, { ...init, headers: { "content-type": "application/json", Authorization: "Bearer " + (await token()), ...(init.headers || {}) } });
  const d = await r.json().catch(() => ({})); if (!d.requestSuccessful) throw new Error("Monnify: " + (d.responseMessage || r.status)); return d.responseBody;
}
export async function initTransaction(o: { ref: string; amountNaira: number; name: string; email: string; description: string }) {
  if (!monnifyOn()) { if (!simulatorOn()) throw new Error("Payments are not configured (MONNIFY_* env)."); return { checkoutUrl: `${appUrl()}/pay/simulate/${o.ref}`, transactionReference: "SIM|" + o.ref }; }
  const b = await call("/api/v1/merchant/transactions/init-transaction", { method: "POST", body: JSON.stringify({ amount: o.amountNaira, customerName: o.name, customerEmail: o.email, paymentReference: o.ref, paymentDescription: o.description.slice(0, 80), currencyCode: "NGN", contractCode: process.env.MONNIFY_CONTRACT_CODE, redirectUrl: `${appUrl()}/pay/return?ref=${encodeURIComponent(o.ref)}`, paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"] }) });
  return { checkoutUrl: b.checkoutUrl as string, transactionReference: b.transactionReference as string };
}
/** Server-to-server status check (never trust the redirect alone). */
export async function verifyTransaction(transactionReference: string): Promise<{ paid: boolean; amountPaid: number; method?: string; raw: any }> {
  const b = await call("/api/v2/transactions/" + encodeURIComponent(transactionReference));
  return { paid: b.paymentStatus === "PAID", amountPaid: Number(b.amountPaid), method: b.paymentMethod, raw: b };
}
/** Webhook signature: HMAC-SHA512(rawBody, secretKey) hex in `monnify-signature`. */
export function validSignature(raw: string, sig: string | null) {
  if (!sig || !process.env.MONNIFY_SECRET_KEY) return false;
  const h = crypto.createHmac("sha512", process.env.MONNIFY_SECRET_KEY).update(raw).digest("hex");
  return h.length === sig.length && crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
}
/** Optional payout for savings withdrawals via Monnify Disbursements (requires MONNIFY_WALLET_ACCOUNT). */
export async function disburse(o: { ref: string; amountNaira: number; bankCode: string; accountNumber: string; narration: string }) {
  if (!monnifyOn() || !process.env.MONNIFY_WALLET_ACCOUNT) return null;
  return call("/api/v2/disbursements/single", { method: "POST", body: JSON.stringify({ amount: o.amountNaira, reference: o.ref, narration: o.narration, destinationBankCode: o.bankCode, destinationAccountNumber: o.accountNumber, currency: "NGN", sourceAccountNumber: process.env.MONNIFY_WALLET_ACCOUNT }) });
}
/** Monnify VAS identity lookups (used by KYC_PROVIDER=monnify). */
export const ninLookup = (nin: string) => call("/api/v1/vas/nin-details", { method: "POST", body: JSON.stringify({ nin }) });
export const bvnMatch = (o: { bvn: string; name: string; dateOfBirth: string; mobileNo: string }) => call("/api/v1/vas/bvn-details-match", { method: "POST", body: JSON.stringify(o) });
