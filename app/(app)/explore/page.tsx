import Link from "next/link";
import Icon from "@/components/Icon";
import { FeaturedTag, ListingCard, PageHead } from "@/components/Bits";
import { Cover } from "@/components/Ui";
import { cities, featured, listings } from "@/lib/q";
import { currentUser, requireUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { track } from "@/lib/pricing";
import { nairaShort } from "@/lib/format";
const Slot = ({ name }: { name: string }) => <div className="rounded-2xl border border-dashed border-silver p-4 text-xs text-silver text-center">Featured · {name} — slot available</div>;
export default async function Explore({ searchParams }: { searchParams: Promise<{ city?: string; q?: string; status?: string }> }) {
  const s = await searchParams; const city = s.city || "All"; const q = (s.q || "").toLowerCase(); const u = await requireUser();
  const [all, unread, cityList, fsAll, rec, sideAll, foot] = await Promise.all([listings(), prisma.reminder.count({ where: { userId: u.id, read: false } }), cities(), featured("search"), featured("recommended"), featured("sidebar"), featured("footer")]);
  const res = all.filter((l) => (city === "All" || l.city === city) && (!s.status || l.status === s.status) && (!q || `${l.title} ${l.estate} ${l.city} ${l.state} ${l.type}`.toLowerCase().includes(q)));
  const fs = fsAll.filter((l) => city === "All" || l.city === city)[0]; const side = sideAll.filter((l) => city === "All" || l.city === city)[0] ?? sideAll[0];
  const tc = city === "All" ? "Lagos" : city;
  await Promise.all([fs && track("search", fs.city), side && track("sidebar", side.city), !q && rec.length && track("recommended", tc), foot.length && track("footer", tc)]);
  const href = (o: Record<string, string>) => "/explore?" + new URLSearchParams({ city, q: s.q || "", status: s.status || "", ...o }).toString();
  return (<div>
    <PageHead title={`Hello, ${u.name.split(" ")[0]}`} sub="Find verified property across Nigeria" right={<Link href="/reminders" className="relative w-10 h-10 grid place-items-center rounded-full bg-white shadow-card text-navy" aria-label="Reminders"><Icon n="bell" />{unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-teal text-white text-[10px] grid place-items-center">{unread}</span>}</Link>} />
    <div className="px-4 lg:px-8 space-y-4">
      <form className="relative"><Icon n="search" className="absolute left-4 top-3.5 w-5 h-5 text-silver" /><input name="q" defaultValue={s.q} className="input pl-11 shadow-card" placeholder="Search estate, city, state or type" /><input type="hidden" name="city" value={city} /></form>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">{cityList.map((c) => <Link key={c} href={href({ city: c })} className={`chip h-9 px-4 text-xs shrink-0 ${c === city ? "bg-navy text-white" : "bg-white text-navy border border-silver-200"}`}>{c}</Link>)}
        {["Completed", "Carcass", "Off-plan"].map((st) => <Link key={st} href={href({ status: s.status === st ? "" : st })} className={`chip h-9 px-4 text-xs shrink-0 ${s.status === st ? "bg-teal text-white" : "bg-white text-teal border border-teal/30"}`}>{st}</Link>)}</div>
      {all.length === 0 && <div className="card p-6 text-center text-sm"><b className="text-navy">No listings yet.</b><p className="text-silver mt-1">{isAdmin(u) ? <>Open <Link className="text-teal underline" href="/admin">Admin</Link> to seed sample data or approve seller listings.</> : "New verified listings are on the way."}</p></div>}
      <div className="lg:flex gap-6"><div className="flex-1 min-w-0 space-y-5">
        {fs ? <Link href={`/property/${fs.id}`} className="block card overflow-hidden hover:shadow-lift transition"><div className="flex"><Cover id={fs.id} src={fs.img} alt="" className="w-32 sm:w-48 shrink-0" /><div className="p-3 min-w-0"><FeaturedTag slot="Search" /><div className="mt-1.5 font-bold text-navy">{nairaShort(fs.price)}</div><div className="text-sm truncate">{fs.title}</div><div className="text-xs text-silver truncate">{fs.estate}</div></div></div></Link> : all.length > 0 && <Slot name="Search" />}
        {!q && rec.length > 0 && <section><div className="flex items-center justify-between mb-2"><h2 className="font-bold text-navy">Recommended for you</h2><span className="text-[11px] text-silver">Featured · Recommended</span></div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x">{rec.map((l) => <div key={l.id} className="w-64 shrink-0 snap-start"><ListingCard l={l} slot="Recommended" compact /></div>)}</div></section>}
        <section><h2 className="font-bold text-navy mb-2">{res.length} properties{city !== "All" ? ` in ${city}` : ""}</h2><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{res.map((l) => <ListingCard key={l.id} l={l} />)}</div></section>
        {foot.length > 0 && <section className="rounded-2xl bg-navy text-white p-4"><div className="text-[11px] text-white/60 mb-2">Featured · Footer</div><div className="flex gap-3 overflow-x-auto no-scrollbar">{foot.map((l) => <Link key={l.id} href={`/property/${l.id}`} className="shrink-0 w-60 flex gap-3 items-center rounded-xl bg-white/10 p-2 hover:bg-white/15"><Cover id={l.id} src={l.img} alt="" className="w-14 h-14 rounded-lg shrink-0" /><div className="min-w-0 text-sm"><b>{nairaShort(l.price)}</b><div className="truncate text-white/70">{l.estate}</div></div></Link>)}</div></section>}
      </div>
      <aside className="hidden lg:block w-72 shrink-0"><div className="sticky top-20 space-y-3"><div className="text-[11px] text-silver">Featured · Sidebar</div>{side ? <ListingCard l={side} slot="Sidebar" /> : <Slot name="Sidebar" />}</div></aside></div>
    </div></div>);
}
