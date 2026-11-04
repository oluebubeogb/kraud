import fs from "fs";
import path from "path";
import { prisma, UPLOAD_DIR } from "./db";
import { SEED_LISTINGS, SEED_SELLERS, SEED_DEALS, SEED_PASSWORD, type SeedListing } from "./listings";
import { hashPw } from "./auth";
import { encrypt } from "./secure";
export const SEED_DIR = path.join(UPLOAD_DIR, "seed");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "and", "<": "", ">": "", '"': "" })[c]!);
const cover = (l: SeedListing) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#002454"/><stop offset="1" stop-color="#1F7A72"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6"><path d="M300 560 L600 320 L900 560 Z"/><rect x="380" y="560" width="440" height="160"/></g><text x="60" y="740" font-family="sans-serif" font-size="44" fill="#fff" fill-opacity=".85">${esc(l.city + " · " + l.estate)}</text></svg>`;
/** Raise terms for a seed listing (whole naira). */
export function seedDeal(l: SeedListing) {
  const [commerceMode, horizon, seats, completion, maintenance, margin, taken] = SEED_DEALS[l.id] ?? ["BUY", "LONG_12_18M", 0, 0, 0, 0, 0];
  const total = l.price + completion + maintenance; const unit = seats ? Math.ceil(total / seats / 10_000) * 10_000 : 0;
  return { commerceMode, horizon, seatsNeeded: seats, seatsTaken: taken, unitPrice: BigInt(unit), totalNeeded: BigInt(seats ? unit * seats : total), amountRaised: BigInt(unit * taken), completionCost: BigInt(completion), maintenanceCost: BigInt(maintenance), minProfitMargin: margin, estimatedProfit: BigInt(Math.round((total * margin) / 100)), raiseStatus: "OPEN", raiseDeadline: new Date(Date.now() + 45 * 864e5) };
}
const kyc = (n: string) => ({ status: "VERIFIED" as const, legalName: "Seed " + n, dob: "1990-01-01", phone: "08000000000", ninMasked: "*******" + n.slice(-4), bvnMasked: "*******" + n.slice(-4), ninEnc: encrypt(n), bvnEnc: encrypt(n), provider: "seed", decidedAt: new Date(), decidedBy: "seed" });
/** One click: seed sellers, buyer, listings and their files (DB rows + files on the /data volume). Idempotent. */
async function localize(id: string, urls: string[]): Promise<string[]> {
  const out: string[] = [];
  for (let n = 0; n < urls.length; n++) {
    const u = urls[n]; if (!/^https?:\/\//.test(u)) { out.push(u); continue; }
    const name = `${id}-${n}.jpg`, f = path.join(SEED_DIR, name);
    if (!fs.existsSync(f) || fs.statSync(f).size < 1000) {
      try { const r = await fetch(u, { signal: AbortSignal.timeout(20000) }); if (!r.ok) throw new Error(String(r.status)); const b = Buffer.from(await r.arrayBuffer()); if (b.length < 1000) throw new Error("tiny"); fs.writeFileSync(f, b); }
      catch { continue; }
    }
    out.push(`/media/seed/${name}`);
  }
  return out;
}
// Free username/email/referralCode held by a leftover seed row with a different id (older seed versions), so upsert can't hit P2002.
async function freeSeedSlot(id: string, username: string, email: string, referralCode: string) {
  const clash = await prisma.user.findMany({ where: { id: { not: id }, OR: [{ username }, { email }, { referralCode }] }, select: { id: true, seed: true, username: true } });
  for (const u of clash) {
    if (!u.seed) throw new Error(`Seed account "${username}" clashes with real user "${u.username}" — rename that user first.`);
    await prisma.listing.deleteMany({ where: { sellerId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }
}
export async function seedAdd() {
  fs.mkdirSync(SEED_DIR, { recursive: true });
  // Every seed account (vendors + buyer) signs in with the same password so the client can switch accounts easily.
  const pw = hashPw(SEED_PASSWORD); let added = 0, files = 0;
  for (const [k, s] of Object.entries(SEED_SELLERS)) {
    const name = SEED_LISTINGS.find((l) => l.seller === k)!.sellerName;
    await freeSeedSlot("seed_" + k, s.username, s.email, "SEED" + k.toUpperCase());
    await prisma.user.upsert({ where: { id: "seed_" + k }, update: { profileImageUrl: s.avatar, username: s.username, email: s.email, name, businessName: name, ...pw }, create: { id: "seed_" + k, username: s.username, email: s.email, name, businessName: name, role: "SELLER", verified: true, seed: true, profileImageUrl: s.avatar, referralCode: "SEED" + k.toUpperCase(), ...pw, kyc: { create: kyc("1000000" + k.padStart(4, "0")) } } });
  }
  await freeSeedSlot("seed_ada", "ada", "ada@demo.kraud.ng", "ADA2026");
  await prisma.user.upsert({ where: { id: "seed_ada" }, update: { profileImageUrl: "/seed/avatars/ada.jpg", ...pw }, create: { id: "seed_ada", username: "ada", email: "ada@demo.kraud.ng", name: "Ada Okafor", verified: true, seed: true, profileImageUrl: "/seed/avatars/ada.jpg", referralCode: "ADA2026", walletBalance: 2_500_000n, ...pw, kyc: { create: kyc("12345674321") } } });
  for (const l of SEED_LISTINGS) {
    const cov = path.join(SEED_DIR, `${l.id}-cover.svg`), meta = path.join(SEED_DIR, `${l.id}.json`);
    fs.writeFileSync(cov, cover(l)); fs.writeFileSync(meta, JSON.stringify(l, null, 1)); files += 2;
    // Each listing ships its own bundled photos (no image is shared between listings); properties lead with portrait shots.
    const local = [...new Set(await localize(l.id, l.gallery))]; files += local.length;
    const img = local[0] ?? `/media/seed/${l.id}-cover.svg`;
    const { seller, sellerName, featured, gallery, attrs, ...rest } = l; void gallery;
    const common = { img, files: [...local, cov, meta], videos: l.videos, kind: l.kind, attrs, ...seedDeal(l) };
    if (await prisma.listing.findUnique({ where: { id: l.id } })) { await prisma.listing.update({ where: { id: l.id }, data: { ...common, title: l.title, city: l.city, estate: l.estate, state: l.state, desc: l.desc, type: l.type, beds: l.beds, baths: l.baths, sqm: l.sqm, status: l.status, sellerId: "seed_" + seller } }); continue; }
    await prisma.listing.create({ data: { ...rest, ...common, price: BigInt(l.price), sellerId: "seed_" + seller, featured: featured ?? [], moderation: "Approved", seed: true } });
    added++;
  }
  // Retire seed listings from older catalogues (e.g. non-Abuja cities) so the pilot stays Abuja-only.
  await prisma.listing.deleteMany({ where: { seed: true, id: { notIn: SEED_LISTINGS.map((l) => l.id) } } });
  // Demo holding for Ada: 2 units in the Wuse 2 apartment, bought ~4 months ago (eligible to sell).
  const ik = await prisma.listing.findUnique({ where: { id: "ab-03" } });
  if (ik && !(await prisma.investmentUnit.findFirst({ where: { userId: "seed_ada" } }))) {
    const at = new Date(Date.now() - 120 * 864e5); const inv = ik.unitPrice * 2n;
    await prisma.investmentUnit.create({ data: { userId: "seed_ada", listingId: ik.id, paymentRef: "SEED-ADA-AB03", units: 2, invested: inv, fees: 15_000n, expectedProfit: (ik.estimatedProfit * 2n) / BigInt(ik.seatsNeeded || 1), createdAt: at, maturesAt: new Date(at.getTime() + 6 * 30.4 * 864e5) } });
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
