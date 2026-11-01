import crypto from "crypto";
import { cookies } from "next/headers";
import { load, tx, uid, type Token, type User } from "./db";
import { randomPhrase } from "./words";
const SECRET = () => process.env.KRAUD_SECRET || "dev-only-secret-change-me";
export const TTL_2FA = 15 * 60 * 1000;
export const hashPw = (pw: string, salt = crypto.randomBytes(16).toString("hex")) => ({ salt, hash: crypto.scryptSync(pw.trim().toLowerCase().replace(/\s+/g, " "), salt, 64).toString("hex") });
export const checkPw = (u: User, pw: string) => crypto.timingSafeEqual(Buffer.from(hashPw(pw, u.salt).hash, "hex"), Buffer.from(u.hash, "hex"));
const sign = (v: string) => v + "." + crypto.createHmac("sha256", SECRET()).update(v).digest("base64url");
const unsign = (s?: string) => { if (!s) return null; const i = s.lastIndexOf("."); const v = s.slice(0, i); return sign(v) === s ? v : null; };
export async function setSession(userId: string) { (await cookies()).set("kraud_s", sign(userId + ":" + Date.now()), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.APP_URL?.startsWith("https"), path: "/", maxAge: 60 * 60 * 24 * 7 }); }
export async function clearSession() { (await cookies()).delete("kraud_s"); }
export async function currentUser(): Promise<User | null> {
  const v = unsign((await cookies()).get("kraud_s")?.value); if (!v) return null;
  return load().users.find((u) => u.id === v.split(":")[0]) ?? null;
}
export const admins = () => (process.env.KRAUD_ADMINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
export const isAdmin = (u: User | null) => !!u && (admins().includes(u.username.toLowerCase()) || admins().includes(u.email.toLowerCase()));
export function findLogin(id: string) { const k = id.trim().toLowerCase(); return load().users.find((u) => u.username.toLowerCase() === k || u.email.toLowerCase() === k); }
export function issueToken(userId: string, kind: Token["kind"], words = 2): Token {
  return tx((db) => { db.tokens = db.tokens.filter((t) => !(t.userId === userId && t.kind === kind)); const t: Token = { id: uid("t_"), userId, kind, phrase: randomPhrase(words), exp: Date.now() + (kind === "verify" ? 24 * 3600e3 : TTL_2FA) }; db.tokens.push(t); return t; });
}
export function useToken(userId: string, kind: Token["kind"], phrase: string): "ok" | "expired" | "invalid" {
  return tx((db) => { const t = db.tokens.find((x) => x.userId === userId && x.kind === kind && !x.used); if (!t) return "invalid"; if (Date.now() > t.exp) return "expired"; if (t.phrase !== phrase.trim().toLowerCase().replace(/\s+/g, " ")) return "invalid"; t.used = true; return "ok"; });
}
