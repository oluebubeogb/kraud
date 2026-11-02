import Trust from "@/components/Trust";
import Link from "next/link";
import Icon from "@/components/Icon";
import { listings } from "@/lib/q";
import { nairaShort } from "@/lib/format";
import CitySketch from "@/components/CitySketch";
export const dynamic = "force-dynamic";
export default async function Landing() { const hero = (await listings().catch(() => [])).slice(0, 8);
  const feat = [["users", "Own Together", "Co-own verified property from one unit — insured, with due diligence on every deal."], ["piggy", "Grow Together", "Track expected profit, save in vaults, and invite friends to earn."], ["chat", "Private 1-on-1 chat", "Talk directly with verified sellers. No group spam."], ["receipt", "Instant receipts", "Every payment gets a Kraud reference, ₦ amount and WAT timestamp."]];
  return (<div className="min-h-screen">
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-silver-200"><div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-3"><Link href="/" aria-label="Kraud"><img src="/logo.png" className="h-9 w-auto" alt="Kraud" /></Link><nav className="ml-6 hidden sm:flex text-sm font-medium text-navy"><Link href="/browse" className="hover:text-teal">Browse properties</Link></nav><div className="ml-auto flex gap-2"><Link href="/login" className="btn-ghost h-10">Sign in</Link><Link href="/signup" className="btn-primary h-10">Get started</Link></div></div></header>
    <section className="bg-navy text-white relative overflow-hidden"><div className="absolute -right-24 -top-24 w-[28rem] h-[28rem] rounded-full bg-teal/30 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-5 py-14 lg:py-24 grid lg:grid-cols-2 gap-10 items-center"><div>
        <h1 className=" text-3xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">Own Together.<br />Grow Together.</h1>
        <p className="mt-4 text-white/75 text-lg max-w-md">No sign-up needed to look around. Co-own verified property from a single unit, or buy it whole — insured, diligence-checked and paid via Monnify or your Kraud wallet.</p>
        <div className="mt-7 flex gap-3"><Link href="/browse" className="btn bg-white text-navy hover:bg-paper h-12 px-6">Browse properties <Icon n="arrow" className="w-4 h-4" /></Link><Link href="/signup" className="btn border border-white/30 text-white h-12 px-6 hover:bg-white/10">Create account</Link></div>
        <div className="mt-8"><Trust dark /></div></div>
        <div className="hidden lg:block"><CitySketch /></div></div></section>
    <section className="max-w-6xl mx-auto px-5 pt-12"><div className="flex items-end justify-between mb-4"><div><h2 className="text-xl font-extrabold text-navy">Properties for sale</h2><p className="text-sm text-silver">Verified listings — browse freely, sign up only to buy, save or chat.</p></div><Link href="/browse" className="text-teal font-semibold text-sm flex items-center gap-1">See all <Icon n="arrow" className="w-4 h-4" /></Link></div>
      {hero.length === 0 ? <div className="card p-6 text-center text-sm text-silver">New verified listings are on the way. <Link href="/browse" className="text-teal underline">Explore</Link></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{hero.map((l, i) => <Link key={l.id} href={`/property/${l.id}`} className="card k-card k-rise overflow-hidden" style={{ ["--i" as any]: i }}><div className="k-img"><img src={l.img} alt="" className="h-44 w-full object-cover" /></div><div className="p-3"><b className="text-navy">{nairaShort(l.price)}</b><div className="text-sm text-navy truncate">{l.title}</div><div className="text-xs text-silver truncate">{l.estate}, {l.city}</div></div></Link>)}</div>}</section>
    <section className="max-w-6xl mx-auto px-5 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{feat.map(([ic, t, d], i) => <div key={t} className="card k-card k-rise p-5" style={{ ["--i" as any]: i }}><div className="k-icon w-11 h-11 rounded-2xl bg-navy-50 text-navy grid place-items-center"><Icon n={ic} /></div><h3 className="mt-3 font-bold text-navy">{t}</h3><p className="text-sm text-silver mt-1">{d}</p></div>)}</section>
    <footer className="border-t border-silver-200 py-8 text-center text-xs text-silver">© 2026 Kraud · Lagos · Abuja · Port Harcourt · Enugu · Umuahia</footer></div>);
}
