import Link from "next/link";
import Icon from "./Icon";
import { Cover } from "./Ui";
import { nairaShort } from "@/lib/format";
import type { Listing } from "@/lib/listings";
export function FeaturedTag({ slot }: { slot?: string }) {
  return <span className="chip bg-white/95 text-navy border border-navy/10 shadow-sm"><Icon n="star" className="w-3 h-3 mr-1 text-teal" />Featured{slot ? ` · ${slot}` : ""}</span>;
}
export const StatusChip = ({ s }: { s: string }) => <span className={`chip ${s === "Completed" ? "bg-teal-50 text-teal" : s === "Carcass" ? "bg-navy-50 text-navy" : "bg-silver-200 text-navy"}`}>{s}</span>;
export function ListingCard({ l, slot, compact }: { l: Listing; slot?: string; compact?: boolean }) {
  return (
    <Link href={`/property/${l.id}`} className="group card overflow-hidden block hover:shadow-lift hover:-translate-y-0.5 transition">
      <div className="relative"><Cover id={l.id} src={l.img} alt={l.title} className={compact ? "h-32" : "h-44"} />
        <div className="absolute top-2 left-2 flex gap-1.5">{slot && <FeaturedTag slot={slot} />}</div>
        <div className="absolute bottom-2 left-2"><StatusChip s={l.status} /></div></div>
      <div className="p-3">
        <div className="text-[17px] font-bold text-navy">{nairaShort(l.price)}</div>
        <div className="text-sm font-medium truncate">{l.title}</div>
        <div className="flex items-center gap-1 text-xs text-silver mt-0.5 truncate"><Icon n="pin" className="w-3.5 h-3.5" />{l.estate}, {l.city}</div>
        <div className="flex gap-3 mt-2 text-xs text-navy/80"><span className="flex items-center gap-1"><Icon n="bed" className="w-4 h-4" />{l.beds}</span><span className="flex items-center gap-1"><Icon n="bath" className="w-4 h-4" />{l.baths}</span><span className="flex items-center gap-1"><Icon n="area" className="w-4 h-4" />{l.sqm}m²</span></div>
      </div>
    </Link>
  );
}
export function PageHead({ title, sub, back, right }: { title: string; sub?: string; back?: string; right?: React.ReactNode }) {
  return (<header className="sticky top-0 z-30 bg-paper/90 backdrop-blur px-4 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center gap-3">
    {back && <Link href={back} className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-card text-navy"><Icon n="back" /></Link>}
    <div className="min-w-0 flex-1"><h1 className="text-xl lg:text-2xl font-extrabold text-navy tracking-tight truncate">{title}</h1>{sub && <p className="text-xs text-silver truncate">{sub}</p>}</div>{right}</header>);
}
