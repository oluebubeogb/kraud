import fs from "fs";
import path from "path";
import { DATA_DIR, tx } from "./db";
import { LISTINGS } from "./listings";
import { hashPw } from "./auth";
const SEED_DIR = path.join(DATA_DIR, "uploads", "seed");
function cover(l: (typeof LISTINGS)[number]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#002454"/><stop offset="1" stop-color="#1F7A72"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6"><path d="M300 560 L600 320 L900 560 Z"/><rect x="380" y="560" width="440" height="160"/></g><text x="60" y="740" font-family="sans-serif" font-size="44" fill="#fff" fill-opacity=".85">${l.city} · ${l.estate.replace(/&/g,"and")}</text></svg>`;
}
export function seedAdd() {
  fs.mkdirSync(SEED_DIR, { recursive: true });
  return tx((db) => {
    let added = 0;
    for (const l of LISTINGS) {
      if (db.listings.some((x) => x.id === l.id)) continue;
      const cov = path.join(SEED_DIR, `${l.id}-cover.svg`);
      const meta = path.join(SEED_DIR, `${l.id}.json`);
      fs.writeFileSync(cov, cover(l)); fs.writeFileSync(meta, JSON.stringify(l, null, 1));
      const files = [cov, meta];
      db.listings.push({ ...l, seed: true, files, moderation: "Approved" }); db.seedFiles.push(...files); added++;
    }
    if (!db.users.some((u) => u.username === "ada")) { const h = hashPw("jollof lekki"); db.users.push({ id: "u_seed_ada", username: "ada", email: "ada@demo.kraud.ng", name: "Ada Okafor", ...h, verified: true, kyc: { nin: "*******4321", bvn: "*******8765", at: Date.now() }, created: Date.now(), seed: true } as any); }
    return { added, files: db.seedFiles.length };
  });
}
export function seedRemove() {
  return tx((db) => {
    const ids = new Set(db.listings.filter((l) => l.seed).map((l) => l.id));
    let removedFiles = 0;
    for (const f of db.seedFiles) { const r = path.resolve(f); if (r.startsWith(SEED_DIR) && fs.existsSync(r)) { fs.unlinkSync(r); removedFiles++; } }
    try { fs.rmSync(SEED_DIR, { recursive: true, force: true }); } catch {}
    db.listings = db.listings.filter((l) => !l.seed);
    db.threads = db.threads.filter((t) => !ids.has(t.listingId));
    db.seedFiles = [];
    const seedUsers = new Set(db.users.filter((u: any) => u.seed).map((u) => u.id));
    db.users = db.users.filter((u) => !seedUsers.has(u.id));
    for (const k of ["payments", "goals", "reminders"] as const) (db as any)[k] = (db as any)[k].filter((x: any) => !seedUsers.has(x.userId));
    db.threads = db.threads.filter((t) => !seedUsers.has(t.buyer));
    return { removedListings: ids.size, removedFiles };
  });
}
