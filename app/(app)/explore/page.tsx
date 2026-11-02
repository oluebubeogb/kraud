import Link from "next/link";
import MobileImmersive from "@/components/MobileImmersive";
import Icon from "@/components/Icon";
import ViewToggle, { FeaturedTag } from "@/components/ViewToggle";
import { ListingCard, PageHead } from "@/components/Bits";
import { Cover } from "@/components/Ui";
import { cities, featured, listings } from "@/lib/q";
import { currentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { track } from "@/lib/pricing";
import { nairaShort } from "@/lib/format";
import Trust from "@/components/Trust";
import { STATUS_LABEL } from "@/lib/listings";
export default async function Explore({ searchParams }: { searchParams: Promise<{ city?: string; q?: string; status?: string; hz?: string; mode?: string }> }) {
  const s = await searchParams; const city = s.city || "All"; const q = (s.q || "").toLowerCase(); const u = await currentUser();
  const [all, unread, cityList, fsAll, rec, sideAll, foot] = await Promise.all([listings(), u ? prisma.reminder.count({ where: { userId: u.id, read: false } }) : Promise.resolve(0), cities(), featured("search"), featured("recommended"), featured("sidebar"), featured("footer")]);
  const res = all.filter((l) => (city === "All" || l.city === city) && (!s.status || l.status === s.status) && (!s.hz || (s.hz === "short" ? l.horizon === "SHORT_6M" : l.horizon === "LONG_12_18M")) && (!s.mode || (s.mode === "invest" ? l.deal.mode !== "BUY" : s.mode === "buy" ? l.deal.mode !== "INVEST" : l.deal.mode === "BOTH")) && (!q || `${l.title} ${l.estate} ${l.city} ${l.state} ${l.type}`.toLowerCase().includes(q)));
  const fs = !q ? undefined : fsAll.filter((l) => city === "All" || l.city === city)[0]; const side = sideAll.filter((l) => city === "All" || l.city === city)[0] ?? sideAll[0];
  const tc = city === "All" ? "Lagos" : city;
  await Promise.all([fs && track("search", fs.city), side && track("sidebar", side.city), !q && rec.length && track("recommended", tc), foot.length && track("footer", tc)]);
  const href = (o: Record<string, string>) => "/explore?" + new URLSearchParams({ city, q: s.q || "", status: s.status || "", hz: s.hz || "", mode: s.mode || "", ...o }).toString();
  return (<div><MobileImmersive />
    <PageHead title={u ? `Welcome, ${u.name.split(" ")[0]}` : "Own Together. Grow Together."} sub={u ? "Own Together. Grow Together." : "Co-own verified property, or buy it whole"} right={u && <div className="flex items-center gap-2"><ViewToggle to="immersive" /><Link href="/reminders" className="relative w-10 h-10 grid place-items-center rounded-full bg-white shadow-card text-navy" aria-label="Reminders"><Icon n="bell" />{unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-teal text-white text-[10px] grid place-items-center">{unread}</span>}</Link></div>} />
    <div className="px-4 lg:px-8 space-y-4">
      {!q && <section className="k-hero k-rise rounded-3xl ring-1 ring-navy/5 p-4 sm:p-5 grid gap-3 sm:grid-cols-[1fr_auto] items-center">
        <div><h2 className="text-lg sm:text-xl font-extrabold text-navy tracking-tight">Invest from one unit, or buy the whole home.</h2><div className="mt-2.5"><Trust compact /></div></div>
        {u ? <Link href="/profile#invite" className="k-pill flex items-center gap-3 rounded-2xl bg-white ring-1 ring-navy/10 p-3 hover:shadow-card"><span className="w-10 h-10 rounded-xl wash-coral grid place-items-center"><Icon n="gift" /></span><span className="leading-tight"><b className="block text-sm text-navy">Invite &amp; Earn</b><span className="text-xs text-silver">Share your code</span></span></Link>
          : <Link href="/signup" className="btn-teal">Get started</Link>}
      </section>}      <form className="relative"><Icon n="search" className="absolute left-4 top-3.5 w-5 h-5 text-silver pointer-events-none z-10" /><input name="q" defaultValue={s.q} className="input search-input shadow-card" placeholder="Search estate, city, state or type" /><input type="hidden" name="city" value={city} /></form>
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="inline-flex rounded-xl bg-navy/[.05] p-1 text-[13px] font-semibold">{([["", "All terms"], ["short", "Short · 6 mo"], ["long", "Long · 12–18 mo"]] as const).map(([k, t]) => <Link key={k} href={href({ hz: k })} className={`px-3 h-8 grid place-items-center rounded-lg transition duration-200 ${(s.hz || "") === k ? "tab-on" : "text-silver hover:text-navy"}`}>{t}</Link>)}</div>
        <div className="inline-flex gap-1.5 text-[12px] font-semibold">{([["", "Any"], ["invest", "Invest"], ["buy", "Buy"], ["both", "Both"]] as const).map(([k, t]) => <Link key={k} href={href({ mode: k })} className={`chip h-8 px-3 transition duration-200 ${(s.mode || "") === k ? "bg-teal text-white" : "bg-white text-teal ring-1 ring-teal/25"}`}>{t}</Link>)}</div></div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">{cityList.map((c) => <Link key={c} href={href({ city: c })} className={`chip h-9 px-4 text-xs shrink-0 ${c === city ? "bg-navy text-white" : "bg-white text-navy border border-silver-200"}`}>{c}</Link>)}
        {["Completed", "Carcass", "Off-plan"].map((st) => <Link key={st} href={href({ status: s.status === st ? "" : st })} className={`chip h-9 px-4 text-xs shrink-0 ${s.status === st ? "bg-navy text-white" : "wash-peach"}`}>{STATUS_LABEL[st]}</Link>)}</div>
      {all.length === 0 && <div className="card p-6 text-center text-sm"><b className="text-navy">No listings yet.</b><p className="text-silver mt-1">{u && isAdmin(u) ? <>Open <Link className="text-teal underline" href="/admin">Admin</Link> to seed sample data or approve seller listings.</> : "New verified listings are on the way."}</p></div>}
      <div className="lg:flex gap-6"><div className="flex-1 min-w-0 space-y-5">
        {fs ? <Link href={`/property/${fs.id}`} className="block card k-card k-rise overflow-hidden"><div className="flex"><div className="relative k-img w-32 sm:w-48 shrink-0"><div className="absolute top-1.5 left-1.5 z-10"><FeaturedTag /></div><Cover id={fs.id} src={fs.img} alt="" className="w-full h-full" /></div><div className="p-3 min-w-0"><div className="font-bold text-navy">{fs.deal.mode !== "BUY" && fs.deal.seats ? <>{nairaShort(fs.deal.unit)}<span className="text-xs text-silver"> /unit · {fs.deal.pct}% raised</span></> : nairaShort(fs.price)}</div><div className="text-sm truncate">{fs.title}</div><div className="text-xs text-silver truncate">{fs.estate}</div></div></div></Link> : null}
        {!q && rec.length > 0 && <section><div className="flex items-center justify-between mb-2"><h2 className="font-bold text-navy">Recommended for you</h2></div>
          <div className="flex flex-col sm:flex-row gap-3 sm:overflow-x-auto no-scrollbar sm:-mx-4 sm:px-4 snap-x">{rec.map((l, i) => <div key={l.id} className="sm:w-64 shrink-0 snap-start"><ListingCard l={l} i={i} compact feat /></div>)}</div></section>}
        <section><h2 className="font-bold text-navy mb-2">{res.length} properties{city !== "All" ? ` in ${city}` : ""}</h2><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{res.map((l, i) => <ListingCard key={l.id} l={l} i={i} feat={l.featured.length > 0} />)}</div></section>
        {foot.length > 0 && <section className="rounded-2xl bg-navy text-white p-4"><div className="flex gap-3 overflow-x-auto no-scrollbar">{foot.map((l) => <Link key={l.id} href={`/property/${l.id}`} className="shrink-0 w-60 flex gap-3 items-center rounded-xl bg-white/10 p-2 hover:bg-white/15 hover:-translate-y-1 transition motion-reduce:transform-none"><Cover id={l.id} src={l.img} alt="" className="w-14 h-14 rounded-lg shrink-0" /><div className="min-w-0 text-sm"><b>{nairaShort(l.price)}</b><div className="truncate text-white/70">{l.estate}</div></div></Link>)}</div></section>}
      </div>
      <aside className="hidden lg:block w-72 shrink-0"><div className="sticky top-20 space-y-3">{side && <ListingCard l={side} feat />}</div></aside></div>
    </div></div>);
}
