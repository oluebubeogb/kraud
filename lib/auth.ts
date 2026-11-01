import crypto from "crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "./db";
import { hmac, safeEq, sha } from "./secure";
import { randomPhrase } from "./words";
export const TTL_2FA = 15 * 60 * 1000;
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
export const hashPw = (pw: string, salt = crypto.randomBytes(16).toString("hex")) => ({ salt, hash: crypto.scryptSync(norm(pw), salt, 64).toString("hex") });
export const checkPw = (u: Pick<User, "salt" | "hash">, pw: string) => crypto.timingSafeEqual(Buffer.from(hashPw(pw, u.salt).hash, "hex"), Buffer.from(u.hash, "hex"));
const COOKIE = "kraud_s";
const secureCookie = () => process.env.NODE_ENV === "production" && (process.env.APP_URL || "").startsWith("https");
export async function setSession(userId: string) {
  const id = crypto.randomBytes(24).toString("base64url"); const exp = new Date(Date.now() + 7 * 864e5);
  await prisma.session.create({ data: { id, userId, expiresAt: exp } });
  (await cookies()).set(COOKIE, id + "." + hmac(id), { httpOnly: true, sameSite: "lax", secure: secureCookie(), path: "/", expires: exp });
}
async function sessionId() { const v = (await cookies()).get(COOKIE)?.value; if (!v) return null; const i = v.lastIndexOf("."); const id = v.slice(0, i); return safeEq(hmac(id), v.slice(i + 1)) ? id : null; }
export async function clearSession() { const id = await sessionId(); if (id) await prisma.session.deleteMany({ where: { id } }); (await cookies()).delete(COOKIE); }
export async function currentUser() {
  const id = await sessionId(); if (!id) return null;
  const s = await prisma.session.findUnique({ where: { id }, include: { user: { include: { kyc: true } } } });
  if (!s || s.expiresAt < new Date()) return null; return s.user;
}
export type Me = NonNullable<Awaited<ReturnType<typeof currentUser>>>;
export const admins = () => (process.env.KRAUD_ADMINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
export const isAdmin = (u: Pick<User, "username" | "email"> | null) => !!u && (admins().includes(u.username.toLowerCase()) || admins().includes(u.email.toLowerCase()));
export const kycOk = (u: Me) => u.kyc?.status === "VERIFIED";
export function findLogin(id: string) { const k = id.trim().toLowerCase(); return prisma.user.findFirst({ where: { OR: [{ username: k }, { email: k }] } }); }
export async function issueToken(userId: string, kind: "verify" | "reset" | "2fa", words = 2) {
  const phrase = randomPhrase(words); const exp = new Date(Date.now() + (kind === "verify" ? 24 * 3600e3 : TTL_2FA));
  await prisma.token.deleteMany({ where: { userId, kind } });
  await prisma.token.create({ data: { userId, kind, phraseHash: sha(phrase), expiresAt: exp } });
  return { phrase, exp: exp.getTime() };
}
export async function useToken(userId: string, kind: string, phrase: string): Promise<"ok" | "expired" | "invalid" | "locked"> {
  const t = await prisma.token.findFirst({ where: { userId, kind, used: false } }); if (!t) return "invalid";
  if (t.attempts >= 5) return "locked"; if (t.expiresAt < new Date()) return "expired";
  if (!safeEq(t.phraseHash, sha(norm(phrase)))) { await prisma.token.update({ where: { id: t.id }, data: { attempts: { increment: 1 } } }); return "invalid"; }
  await prisma.token.update({ where: { id: t.id }, data: { used: true } }); return "ok";
}
/** For server pages: redirects to /login instead of throwing when the session is missing. */
export async function requireUser() { const u = await currentUser(); if (!u) (await import("next/navigation")).redirect("/login"); return u!; }
