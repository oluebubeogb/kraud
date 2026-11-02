/** Client-safe raise / co-own math. All money in whole naira (number). */
export type Mode = "INVEST" | "BUY" | "BOTH";
export type Hz = "SHORT_6M" | "LONG_12_18M";
export const HORIZON: Record<Hz, { label: string; short: string; months: number }> = {
  SHORT_6M: { label: "Short term · ~6 months", short: "6 mo", months: 6 },
  LONG_12_18M: { label: "Long term · 12–18 months", short: "12–18 mo", months: 18 },
};
export const MODE_LABEL: Record<Mode, string> = { INVEST: "Co-own", BUY: "Buy whole", BOTH: "Co-own or buy" };
export type DealIn = { price: number; mode: Mode; horizon: Hz; totalNeeded: number; unitPrice: number; seatsNeeded: number; seatsTaken: number; amountRaised: number; maintenanceCost: number; completionCost: number; minProfitMargin: number; estimatedProfit: number; raiseStatus: string };
export type Deal = DealIn & { canInvest: boolean; canBuy: boolean; total: number; unit: number; seats: number; seatsLeft: number; pct: number; profit: number; profitPerUnit: number; roiPct: number; months: number };
export function deal(d: DealIn): Deal {
  const total = d.totalNeeded || d.price + d.completionCost + d.maintenanceCost;
  const seats = d.seatsNeeded || (d.unitPrice ? Math.ceil(total / d.unitPrice) : 0);
  const unit = d.unitPrice || (seats ? Math.ceil(total / seats) : 0);
  const profit = d.estimatedProfit || Math.round((total * d.minProfitMargin) / 100);
  const open = d.raiseStatus === "OPEN";
  const canInvest = open && d.mode !== "BUY" && seats > 0 && d.seatsTaken < seats;
  const canBuy = open && d.mode !== "INVEST" && d.seatsTaken === 0;
  return { ...d, total, unit, seats, seatsLeft: Math.max(0, seats - d.seatsTaken), pct: total ? Math.min(100, Math.round((d.amountRaised / total) * 100)) : 0, profit, profitPerUnit: seats ? Math.floor(profit / seats) : 0, roiPct: total ? Math.round((profit / total) * 1000) / 10 : 0, months: HORIZON[d.horizon].months, canInvest, canBuy };
}
/** Profit earned to date (pro-rata over horizon) and the 50% early-exit forfeit. */
export function exitQuote(o: { invested: number; expectedProfit: number; createdAt: Date; maturesAt: Date; now?: Date }) {
  const now = (o.now ?? new Date()).getTime(); const start = o.createdAt.getTime(); const end = o.maturesAt.getTime();
  const frac = Math.max(0, Math.min(1, (now - start) / Math.max(1, end - start)));
  const earned = Math.floor(o.expectedProfit * frac); const forfeit = Math.floor(earned / 2);
  const eligible = now - start >= 90 * 864e5;
  return { earned, forfeit, refund: o.invested + earned - forfeit, eligible, eligibleAt: new Date(start + 90 * 864e5) };
}
export const VAULT_TIERS = [{ months: 3, key: "rate:vault3", def: 2.5 }, { months: 12, key: "rate:vault12", def: 10 }] as const;
export type FeeCfg = { insPct: number; insFloor: number; dilPct: number; dilFloor: number; insFixed: number | null; dilFixed: number | null };
/** Pure fee math (shared by server + checkout UI). Insurance applies to co-own units only. */
export function calcFees(c: FeeCfg, amount: number, kind: "INVEST" | "PURCHASE", units = 1) {
  const insurance = kind === "INVEST" ? (c.insFixed != null ? c.insFixed * units : Math.max(c.insFloor, Math.round((amount * c.insPct) / 100))) : 0;
  const diligence = c.dilFixed != null ? c.dilFixed : Math.min(5_000_000, Math.max(c.dilFloor, Math.round((amount * c.dilPct) / 100)));
  return { insurance, diligence, total: insurance + diligence };
}
