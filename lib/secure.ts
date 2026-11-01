import crypto from "crypto";
const secret = () => {
  const s = process.env.KRAUD_SECRET;
  if (!s || s.length < 24) { if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") throw new Error("KRAUD_SECRET must be set (24+ chars) in production"); return "dev-only-secret-change-me-dev-only"; }
  return s;
};
const key = () => crypto.createHash("sha256").update("kraud-enc:" + secret()).digest();
export const hmac = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("base64url");
export const sha = (v: string) => crypto.createHash("sha256").update(secret() + ":" + v).digest("hex");
export function encrypt(plain: string) { const iv = crypto.randomBytes(12); const c = crypto.createCipheriv("aes-256-gcm", key(), iv); const e = Buffer.concat([c.update(plain, "utf8"), c.final()]); return [iv, c.getAuthTag(), e].map((b) => b.toString("base64url")).join("."); }
export function decrypt(enc: string) { const [iv, tag, e] = enc.split(".").map((s) => Buffer.from(s, "base64url")); const d = crypto.createDecipheriv("aes-256-gcm", key(), iv); d.setAuthTag(tag); return Buffer.concat([d.update(e), d.final()]).toString("utf8"); }
export const safeEq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
// tiny in-memory rate limiter (single container); key -> timestamps
const hits = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs: number) { const now = Date.now(); const a = (hits.get(key) || []).filter((t) => now - t < windowMs); a.push(now); hits.set(key, a); return a.length > max; }
