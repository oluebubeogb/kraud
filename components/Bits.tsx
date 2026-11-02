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
import SeeMore from "./SeeMore";
export const StatusChip = ({ s }: { s: string }) => <span className={`chip ${s === "Completed" ? "wash-teal" : s === "Carcass" ? "wash-peach" : "wash-blue"} bg-white/95`}>{STATUS_LABEL[s] || s}</span>;
export function ListingCard({ l, compact, i = 0, feat }: { l: Listing; compact?: boolean; i?: number; feat?: boolean }) {
  const coown = l.deal.mode !== "BUY" && l.deal.seats > 0;
  return (
    <div className="group card k-card k-rise overflow-hidden" style={{ ["--i" as any]: i % 12 }}>
      <Link href={`/property/${l.id}`} className="block relative k-img"><Cover id={l.id} src={l.img} alt={l.title} className={compact ? "h-32" : "h-[calc(11rem+1.25vh)] sm:h-44"} />
        {photos(l).length > 1 && <span className="absolute top-2 right-2 z-10 chip bg-black/45 text-white text-[10px] backdrop-blur">1/{photos(l).length}</span>}</Link>
      <div className="p-3">
        <Link href={`/property/${l.id}`} className="block text-[15px] font-semibold text-navy truncate">{l.title}</Link>
        <div className="text-[14px] font-semibold text-teal">{coown ? <>{nairaShort(l.deal.unit)}<span className="font-medium text-silver"> / unit · whole {nairaShort(l.price)}</span></> : <>{nairaShort(l.price)}{l.raiseStatus === "SOLD" && <span className="ml-2 chip wash-coral">Sold</span>}</>}</div>
        <div className="flex items-center gap-1 text-[13px] text-silver mt-0.5 min-w-0"><Icon n="pin" className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{l.estate}, {l.city}</span><span className="ml-auto shrink-0 pl-2"><SeeMore m={{ id: l.id, title: l.title, seller: l.sellerName, sellerId: l.sellerId, sellerImg: l.sellerImg, deal: l.deal, featured: feat, tags: [l.type, STATUS_LABEL[l.status] || l.status, `${l.beds}bd ${l.baths}ba ${l.sqm}m²`] }} /></span></div>
      </div>
    </div>
  );
}
export function PageHead({ title, sub, back, right }: { title: string; sub?: string; back?: string; right?: React.ReactNode }) {
  return (<header className="sticky top-0 z-30 bg-paper/90 backdrop-blur px-4 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center gap-3">
    {back && <Link href={back} className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-card text-navy"><Icon n="back" /></Link>}
    <div className="min-w-0 flex-1"><h1 className="text-lg lg:text-xl font-bold text-navy tracking-tight truncate">{title}</h1>{sub && <p className="text-xs text-silver truncate">{sub}</p>}</div>{right}</header>);
}
