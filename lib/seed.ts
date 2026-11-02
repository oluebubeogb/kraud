import fs from "fs";
import path from "path";
import { prisma, UPLOAD_DIR } from "./db";
import { SEED_LISTINGS, SEED_SELLERS, type SeedListing } from "./listings";
import { hashPw } from "./auth";
import { encrypt } from "./secure";
/** Interior/portrait shots so seed galleries mix orientations. */
const EXTRA = ["photo-1600607687939-ce8a6c25118c", "photo-1600566753190-17f0baa2a6c3", "photo-1502005229762-cf1b2da7c5d6"].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=1600&q=70`);
export const SEED_DIR = path.join(UPLOAD_DIR, "seed");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "and", "<": "", ">": "", '"': "" })[c]!);
const cover = (l: SeedListing) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#002454"/><stop offset="1" stop-color="#1F7A72"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6"><path d="M300 560 L600 320 L900 560 Z"/><rect x="380" y="560" width="440" height="160"/></g><text x="60" y="740" font-family="sans-serif" font-size="44" fill="#fff" fill-opacity=".85">${esc(l.city + " · " + l.estate)}</text></svg>`;
const kyc = (n: string) => ({ status: "VERIFIED" as const, legalName: "Seed " + n, dob: "1990-01-01", phone: "08000000000", ninMasked: "*******" + n.slice(-4), bvnMasked: "*******" + n.slice(-4), ninEnc: encrypt(n), bvnEnc: encrypt(n), provider: "seed", decidedAt: new Date(), decidedBy: "seed" });
/** One click: seed sellers, buyer, listings and their files (DB rows + files on the /data volume). Idempotent. */
export async function seedAdd() {
  fs.mkdirSync(SEED_DIR, { recursive: true });
  const sellerPw = hashPw("suya abuja"); const buyerPw = hashPw("jollof lekki"); let added = 0, files = 0;
  for (const [k, s] of Object.entries(SEED_SELLERS)) {
    const name = SEED_LISTINGS.find((l) => l.seller === k)!.sellerName;
    await prisma.user.upsert({ where: { id: "seed_" + k }, update: {}, create: { id: "seed_" + k, username: s.username, email: s.email, name, businessName: name, role: "SELLER", verified: true, seed: true, ...sellerPw, kyc: { create: kyc("1000000" + k.padStart(4, "0")) } } });
  }
  await prisma.user.upsert({ where: { id: "seed_ada" }, update: {}, create: { id: "seed_ada", username: "ada", email: "ada@demo.kraud.ng", name: "Ada Okafor", verified: true, seed: true, ...buyerPw, kyc: { create: kyc("12345674321") } } });
  for (const l of SEED_LISTINGS) {
    const cov = path.join(SEED_DIR, `${l.id}-cover.svg`), meta = path.join(SEED_DIR, `${l.id}.json`);
    fs.writeFileSync(cov, cover(l)); fs.writeFileSync(meta, JSON.stringify(l, null, 1)); files += 2;
    const k = SEED_LISTINGS.indexOf(l); const pool = SEED_LISTINGS.map((x) => x.img).filter((x) => x !== l.img); const gallery = [l.img, ...[0, 3, 6].map((o) => pool[(k + o) % pool.length]), ...EXTRA.slice(k % 2, (k % 2) + 2)];
    if (await prisma.listing.findUnique({ where: { id: l.id } })) { await prisma.listing.update({ where: { id: l.id }, data: { files: [...gallery, cov, meta] } }); continue; }
    const { seller, sellerName, featured, ...rest } = l;
    await prisma.listing.create({ data: { ...rest, price: BigInt(l.price), sellerId: "seed_" + seller, featured: featured ?? [], moderation: "Approved", seed: true, files: [...gallery, cov, meta] } });
    added++;
  }
  return { added, files };
}
/** One click: delete every seed row (cascades threads/payments/goals of seed users) and the seed folder on the volume. Real users' uploads are untouched. */
export async function seedRemove() {
  const removedListings = (await prisma.listing.deleteMany({ where: { seed: true } })).count;
  await prisma.user.deleteMany({ where: { seed: true } });
  let removedFiles = 0;
  if (fs.existsSync(SEED_DIR)) { removedFiles = fs.readdirSync(SEED_DIR).length; fs.rmSync(SEED_DIR, { recursive: true, force: true }); }
  return { removedListings, removedFiles };
}
export async function seedStats() { return { listings: await prisma.listing.count({ where: { seed: true } }), files: fs.existsSync(SEED_DIR) ? fs.readdirSync(SEED_DIR).length : 0, users: await prisma.user.count() }; }
