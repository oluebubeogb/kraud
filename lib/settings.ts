import { calcFees, type FeeCfg } from "./deal";
import { prisma } from "./db";
export const SETTING_DEFAULTS = {
  "fee:insurancePct": 1, // % of unit cost
  "fee:insuranceFloor": 2_500, // ₦ min per investment
  "fee:diligenceFloor": 5_000, // ₦ min per investment / purchase
  "fee:diligencePct": 0.5,
  "insurer": "Leadway Assurance (partner)",
  "referral:reward": 5_000,
  "rate:vault3": 2.5,
  "rate:vault12": 10,
} as const;
export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = { -readonly [K in SettingKey]: (typeof SETTING_DEFAULTS)[K] extends number ? number : string };
export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany({ where: { key: { in: Object.keys(SETTING_DEFAULTS) } } });
  const out: Record<string, number | string> = { ...SETTING_DEFAULTS };
  for (const r of rows) { const d = SETTING_DEFAULTS[r.key as SettingKey]; out[r.key] = typeof d === "number" ? Number(r.value) || 0 : r.value; }
  return out as Settings;
}
export async function setSetting(key: SettingKey, value: string | number) { await prisma.setting.upsert({ where: { key }, create: { key, value: String(value) }, update: { value: String(value) } }); }
export const feeCfg = (s: Settings, l: { insuranceFee: bigint | number | null; diligenceFee: bigint | number | null }): FeeCfg => ({ insPct: s["fee:insurancePct"], insFloor: s["fee:insuranceFloor"], dilPct: s["fee:diligencePct"], dilFloor: s["fee:diligenceFloor"], insFixed: l.insuranceFee == null ? null : Number(l.insuranceFee), dilFixed: l.diligenceFee == null ? null : Number(l.diligenceFee) });
/** Fees for an investment of `amount` (unit cost) or a whole purchase. Listing overrides win; admin floors apply. */
export const fees = (s: Settings, amount: number, l: { insuranceFee: bigint | number | null; diligenceFee: bigint | number | null }, kind: "INVEST" | "PURCHASE", units = 1) => calcFees(feeCfg(s, l), amount, kind, units);
