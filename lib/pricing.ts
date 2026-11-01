import { prisma } from "./db";
/** Meta-style placement pricing: forecast impressions (live trailing 14 days blended with a city baseline) × slot CPM,
 * deterministic per-(slot,city) jitter so no two placements share a price, floored by admin minimums. */
export const SLOTS = ["search", "sidebar", "immersive", "footer", "recommended"] as const;
const SLOT_CPM: Record<string, number> = { search: 4200, sidebar: 2600, immersive: 6100, footer: 1500, recommended: 3400 };
const SLOT_SHARE: Record<string, number> = { search: 0.38, sidebar: 0.22, immersive: 0.12, footer: 0.31, recommended: 0.27 };
const CITY_BASE: Record<string, number> = { Lagos: 182000, Abuja: 121000, "Port Harcourt": 74000, Umuahia: 31000, Enugu: 46000 };
export const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Umuahia"];
const day = (d = new Date()) => d.toISOString().slice(0, 10);
export async function track(slot: string, city: string) {
  try { await prisma.impression.upsert({ where: { slot_city_day: { slot, city, day: day() } }, create: { slot, city, day: day(), count: 1 }, update: { count: { increment: 1 } } }); } catch {}
}
export async function adminMins(): Promise<Record<string, number>> {
  const rows = await prisma.setting.findMany({ where: { key: { startsWith: "min:" } } });
  const m: Record<string, number> = Object.fromEntries(SLOTS.map((s) => [s, 15000]));
  for (const r of rows) m[r.key.slice(4)] = Number(r.value); return m;
}
function jitter(slot: string, city: string) { let h = 0; for (const c of slot + "|" + city) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 1 + ((h % 997) / 997) * 0.06; }
export async function quoteAll() {
  const since = day(new Date(Date.now() - 14 * 864e5));
  const imp = await prisma.impression.groupBy({ by: ["slot", "city"], where: { day: { gte: since } }, _sum: { count: true } });
  const mins = await adminMins(); const cs = [...new Set([...CITIES, ...(await prisma.listing.findMany({ distinct: ["city"], select: { city: true } })).map((x) => x.city)])]; const out: Record<string, Record<string, { impressions: number; daily: number; live: number }>> = {};
  for (const s of SLOTS) { out[s] = {}; for (const c of cs) {
    const live = (imp.find((x) => x.slot === s && x.city === c)?._sum.count ?? 0) / 14; // avg/day observed
    const baseline = (CITY_BASE[c] ?? 30000) * SLOT_SHARE[s] / 7;
    const forecast = Math.round(live > 0 ? 0.6 * live * 7 + 0.4 * baseline * 7 : baseline * 7); // weekly impressions
    const daily = Math.max(mins[s] ?? 15000, Math.round(((forecast / 1000) * SLOT_CPM[s] / 7) * jitter(s, c)));
    out[s][c] = { impressions: forecast, daily, live: Math.round(live) };
  } }
  // guarantee uniqueness across the grid
  const seen = new Set<number>(); for (const s of SLOTS) for (const c of cs) { while (seen.has(out[s][c].daily)) out[s][c].daily += 50; seen.add(out[s][c].daily); }
  return out;
}
export async function quote(slot: string, city: string) { const q = await quoteAll(); return q[slot]?.[city] ?? { impressions: 0, daily: (await adminMins())[slot] ?? 15000, live: 0 }; }
