import Icon from "./Icon";
import Tip from "./Tip";
const ITEMS = [
  ["check", "Verified", "Every seller is KYC-checked and every listing reviewed", "wash-teal"],
  ["shield", "Insured", "Co-own units carry partner insurance on the raise pool", "wash-blue"],
  ["key", "Due diligence", "Title, survey and site checks before a raise opens", "wash-violet"],
  ["users", "Own Together", "Buy units with others, or buy the whole home", "wash-mint"],
] as const;
export default function Trust({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (<div className="flex flex-wrap gap-2">{ITEMS.map(([i, t, s, w], n) => (
    <Tip key={t} text={s}><span style={{ ["--i" as any]: n }} className={`k-pill k-rise inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-[#002454]/10"}`}>
      <span className={`w-6 h-6 rounded-full grid place-items-center ${dark ? "bg-white/15 text-white" : w}`}><Icon n={i} className="w-3.5 h-3.5" /></span>
      <b className={`text-[12px] ${compact ? "" : "sm:text-[13px]"} ${dark ? "text-white" : "text-[#002454]"}`}>{t}</b></span></Tip>))}</div>);
}
