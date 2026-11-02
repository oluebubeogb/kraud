import { FeaturedTag } from "./ViewToggle";
import { photos } from "@/lib/photos";
import Link from "next/link";
import Icon from "./Icon";
import { Cover } from "./Ui";
import { nairaShort } from "@/lib/format";
import type { L as Listing } from "@/lib/q";
import { ModeChip, RaiseBar } from "./Deal";
import { HORIZON } from "@/lib/deal";
import { STATUS_LABEL } from "@/lib/listings";
export const StatusChip = ({ s }: { s: string }) => <span className={`chip ${s === "Completed" ? "wash-teal" : s === "Carcass" ? "wash-peach" : "wash-blue"} bg-white/95`}>{STATUS_LABEL[s] || s}</span>;
export function ListingCard({ l, compact, i = 0, feat }: { l: Listing; compact?: boolean; i?: number; feat?: boolean }) {
  return (
    <Link href={`/property/${l.id}`} className="group card k-card k-rise overflow-hidden block" style={{ ["--i" as any]: i % 12 }}>
      <div className="relative k-img"><Cover id={l.id} src={l.img} alt={l.title} className={compact ? "h-32" : "h-44"} />
        {feat && <div className="absolute top-2 left-2 z-10"><FeaturedTag /></div>}{photos(l).length > 1 && <span className="absolute top-2 right-2 z-10 chip bg-black/45 text-white text-[10px] backdrop-blur">1/{photos(l).length}</span>}<div className="absolute bottom-2 left-2 flex gap-1.5"><StatusChip s={l.status} /><span className="chip bg-white/95"><ModeChip d={l.deal} /></span></div></div>
      <div className="p-3">
        {l.deal.mode !== "BUY" && l.deal.seats ? <div className="flex items-baseline justify-between gap-2"><div className="text-[17px] font-bold text-navy">{nairaShort(l.deal.unit)}<span className="text-xs font-semibold text-silver"> /unit</span></div><span className="text-[11px] font-bold wash-mint rounded-full px-2 py-0.5">+{l.deal.roiPct}% · {HORIZON[l.deal.horizon].short}</span></div>
          : <div className="text-[17px] font-bold text-navy">{nairaShort(l.price)}{l.raiseStatus === "SOLD" && <span className="ml-2 chip wash-coral">Sold</span>}</div>}
        <div className="text-sm font-medium truncate">{l.title}</div>
        <div className="flex items-center gap-1 text-xs text-silver mt-0.5 truncate"><Icon n="pin" className="w-3.5 h-3.5" />{l.estate}, {l.city}</div>
        <div className="flex gap-3 mt-2 text-xs text-navy/80"><span className="flex items-center gap-1"><Icon n="bed" className="w-4 h-4" />{l.beds}</span><span className="flex items-center gap-1"><Icon n="bath" className="w-4 h-4" />{l.baths}</span><span className="flex items-center gap-1"><Icon n="area" className="w-4 h-4" />{l.sqm}m²</span></div>
        {!compact && l.deal.mode !== "BUY" && l.deal.seats > 0 && <div className="mt-2.5"><RaiseBar d={l.deal} /></div>}
      </div>
    </Link>
  );
}
export function PageHead({ title, sub, back, right }: { title: string; sub?: string; back?: string; right?: React.ReactNode }) {
  return (<header className="sticky top-0 z-30 bg-paper/90 backdrop-blur px-4 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center gap-3">
    {back && <Link href={back} className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-card text-navy"><Icon n="back" /></Link>}
    <div className="min-w-0 flex-1"><h1 className="text-xl lg:text-2xl font-extrabold text-navy tracking-tight truncate">{title}</h1>{sub && <p className="text-xs text-silver truncate">{sub}</p>}</div>{right}</header>);
}
