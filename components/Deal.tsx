import Icon from "./Icon";
import Tip from "./Tip";
import { nairaShort, naira } from "@/lib/format";
import { HORIZON, MODE_LABEL, type Deal } from "@/lib/deal";
export const ModeChip = ({ d, dark }: { d: Deal; dark?: boolean }) => <span className={`chip ${dark ? "bg-white/15 text-white backdrop-blur" : d.mode === "BUY" ? "wash-blue" : d.mode === "INVEST" ? "wash-mint" : "wash-violet"}`}>{MODE_LABEL[d.mode]}</span>;
export function RaiseBar({ d, dark }: { d: Deal; dark?: boolean }) {
  return (<div><div className={`k-bar ${dark ? "!bg-white/20" : ""}`}><i style={{ width: `${Math.max(d.pct, 2)}%` }} /></div>
    <div className={`flex justify-between mt-1 text-[11px] ${dark ? "text-white/75" : "text-silver"}`}><span><b className={dark ? "text-white" : "text-navy"}>{d.pct}%</b> raised</span><span>{d.seatsLeft} of {d.seats} units left</span></div></div>);
}
/** Deal sheet: raise %, seats, est. profit, timeframe. `overlay` = for photos (dark glass). */
export function DealSheet({ d, overlay, compact }: { d: Deal; overlay?: boolean; compact?: boolean }) {
  const coown = d.mode !== "BUY" && d.seats > 0;
  const stat = (icon: string, label: string, value: string, wash: string) => (
    <div className={`flex items-center gap-2 min-w-0 ${overlay ? "" : "rounded-xl px-2.5 py-2 " + wash.replace("wash-", "wash-")}`}>
      <span className={`w-7 h-7 shrink-0 rounded-lg grid place-items-center ${overlay ? "bg-white/15 text-white" : "bg-white/70"}`}><Icon n={icon} className="w-4 h-4" /></span>
      <span className="min-w-0 leading-tight"><span className={`block text-[10px] uppercase tracking-wide ${overlay ? "text-white/60" : "opacity-70"}`}>{label}</span><b className={`block text-[13px] truncate ${overlay ? "text-white" : ""}`}>{value}</b></span></div>);
  if (!coown) return (<div className={`grid grid-cols-2 gap-2 ${overlay ? "" : ""}`}>{stat("key", "Buy whole", nairaShort(d.price), "wash-blue")}{stat("clock", "Handover", d.raiseStatus === "SOLD" ? "Sold" : "Direct", "wash-cyan")}</div>);
  return (<div className={overlay ? "rounded-2xl bg-black/35 backdrop-blur-md ring-1 ring-white/15 p-3 space-y-2.5" : "space-y-2.5"}>
    <RaiseBar d={d} dark={overlay} />
    <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} gap-2`}>
      {stat("coins", "Per unit", nairaShort(d.unit), "wash-teal")}
      {stat("users", "Units", `${d.seats - d.seatsLeft}/${d.seats}`, "wash-violet")}
      {stat("trend", "Est. profit", `${d.roiPct}%`, "wash-mint")}
      {stat("clock", "Timeframe", HORIZON[d.horizon].short, "wash-gold")}
    </div></div>);
}
export function FeeLine({ insurance, diligence, insurer }: { insurance: number; diligence: number; insurer: string }) {
  return (<div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-silver">Insurance + due diligence <Tip text={`Insurance ${naira(insurance)} via ${insurer}. Due diligence ${naira(diligence)} covers title, survey and site checks.`} /></span><b className="text-navy">{naira(insurance + diligence)}</b></div>);
}
export const RiskLine = () => <p className="text-[11px] text-silver flex items-center gap-1.5"><Icon n="info" className="w-3.5 h-3.5 shrink-0" />Property values can fall; profits are estimates, not guarantees.</p>;
export function Avatar({ src, name, size = 36, className = "" }: { src?: string | null; name: string; size?: number; className?: string }) {
  const ini = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={name} width={size} height={size} className={`rounded-full object-cover ring-2 ring-white shrink-0 ${className}`} style={{ width: size, height: size }} />
    : <span className={`rounded-full grid place-items-center font-bold text-white bg-gradient-to-br from-navy to-teal ring-2 ring-white shrink-0 ${className}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>{ini}</span>;
}
