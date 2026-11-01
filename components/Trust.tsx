import Icon from "./Icon";
const ITEMS = [["shield", "100% escrow-protected", "Funds held until handover"], ["chat", "1:1 verified chat", "Talk directly to the seller"], ["check", "Verified listings", "Every property reviewed"]] as const;
export default function Trust({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (<div className={`flex flex-wrap gap-2.5 ${compact ? "" : "sm:gap-3"}`}>{ITEMS.map(([i, t, s], n) => (
    <div key={t} style={{ ["--i" as any]: n }} className={`k-pill k-rise flex items-center gap-2.5 rounded-2xl pl-1.5 pr-3.5 py-1.5 ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-[#F7F8FA] ring-1 ring-[#002454]/10"}`}>
      <span className={`w-8 h-8 rounded-xl transition-transform duration-300 group-hover:scale-110 grid place-items-center ${dark ? "bg-[#1F7A72]/30 text-[#7FC4BD]" : "bg-[#1F7A72]/10 text-[#1F7A72]"}`}><Icon n={i} className="w-4 h-4" /></span>
      <span className="leading-tight"><b className={`block text-[13px] ${dark ? "text-white" : "text-[#002454]"}`}>{t}</b>{!compact && <span className={`text-[11px] ${dark ? "text-white/60" : "text-[#8A9199]"}`}>{s}</span>}</span></div>))}</div>);
}
