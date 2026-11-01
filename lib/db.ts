import fs from "fs";
import path from "path";
import type { Listing } from "./listings";
export const DATA_DIR = path.resolve(process.env.KRAUD_DATA_DIR || "./data");
const DB_FILE = path.join(DATA_DIR, "kraud-db.json");
export type User = { id: string; username: string; email: string; name: string; hash: string; salt: string; verified: boolean; kyc?: { nin: string; bvn: string; at: number }; created: number };
export type Token = { id: string; userId: string; kind: "verify" | "reset" | "2fa"; phrase: string; exp: number; used?: boolean };
export type Payment = { ref: string; userId: string; listingId: string; title: string; amount: number; fee: number; method: string; at: number; status: "Paid in escrow" };
export type Goal = { id: string; userId: string; listingId: string; title: string; target: number; saved: number; created: number };
export type Msg = { from: string; text: string; at: number };
export type Thread = { id: string; buyer: string; seller: string; sellerName: string; listingId: string; msgs: Msg[] };
export type Reminder = { id: string; userId: string; title: string; body: string; at: number; read?: boolean };
export type DB = { users: User[]; tokens: Token[]; payments: Payment[]; goals: Goal[]; threads: Thread[]; reminders: Reminder[]; listings: (Listing & { seed?: boolean; files?: string[]; moderation?: string })[]; seedFiles: string[] };
const empty = (): DB => ({ users: [], tokens: [], payments: [], goals: [], threads: [], reminders: [], listings: [], seedFiles: [] });
export function load(): DB {
  try { return { ...empty(), ...JSON.parse(fs.readFileSync(DB_FILE, "utf8")) }; } catch { return empty(); }
}
export function save(db: DB) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(db, null, 1)); fs.renameSync(tmp, DB_FILE);
}
export function tx<T>(fn: (db: DB) => T): T { const db = load(); const r = fn(db); save(db); return r; }
export const uid = (p = "") => p + require("crypto").randomBytes(6).toString("hex");
