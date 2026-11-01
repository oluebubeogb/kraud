import Link from "next/link";
import Icon from "@/components/Icon";
import { LISTINGS } from "@/lib/listings";
import { nairaShort } from "@/lib/format";
export default function Landing() {
  const feat = [["shield", "Escrow on every deal", "Funds held by Kraud's escrow agent and released only after handover."], ["piggy", "Save toward a home", "Lock a listing and build a target pot — not a bank account, a purchase plan."], ["chat", "Private 1-on-1 chat", "Talk directly with verified sellers. No group spam."], ["receipt", "Instant receipts", "Every payment gets a Kraud reference, ₦ amount and WAT timestamp."]];
  return (<div className="min-h-screen">
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-silver-200"><div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-3"><img src="/icons/icon-192.png" className="w-9 h-9 rounded-lg" alt="Kraud" /><span className="text-xl font-extrabold text-navy tracking-tight">kraud</span><div className="ml-auto flex gap-2"><Link href="/login" className="btn-ghost h-10">Sign in</Link><Link href="/signup" className="btn-primary h-10">Get started</Link></div></div></header>
    <section className="bg-navy text-white relative overflow-hidden"><div className="absolute -right-24 -top-24 w-[28rem] h-[28rem] rounded-full bg-teal/30 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-5 py-14 lg:py-24 grid lg:grid-cols-2 gap-10 items-center"><div>
        <span className="chip bg-white/10 text-white/90">Now live nationwide · incl. Umuahia</span>
        <h1 className="mt-4 text-4xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">Own verified property<br />across Nigeria.</h1>
        <p className="mt-4 text-white/75 text-lg max-w-md">Browse, save toward, and buy homes from trusted developers — protected by escrow and paid via Monnify.</p>
        <div className="mt-7 flex gap-3"><Link href="/signup" className="btn bg-white text-navy hover:bg-paper h-12 px-6">Create account <Icon n="arrow" className="w-4 h-4" /></Link><Link href="/explore" className="btn border border-white/30 text-white h-12 px-6 hover:bg-white/10">Explore listings</Link></div>
        <div className="mt-8 flex gap-8 text-sm"><div><b className="text-2xl block">5</b><span className="text-white/60">cities at launch</span></div><div><b className="text-2xl block">100%</b><span className="text-white/60">escrow-protected</span></div><div><b className="text-2xl block">1:1</b><span className="text-white/60">verified chat</span></div></div></div>
        <div className="hidden lg:block relative"><img src="/mark.png" alt="" className="absolute -top-10 right-0 w-28 opacity-90" /><div className="grid grid-cols-2 gap-4">{LISTINGS.slice(0, 4).map((l, i) => <div key={l.id} className={`rounded-2xl overflow-hidden bg-white/10 ${i % 2 ? "translate-y-8" : ""}`}><img src={l.img} alt="" className="h-40 w-full object-cover" /><div className="p-3 text-sm"><b>{nairaShort(l.price)}</b><div className="text-white/70 truncate">{l.estate}</div></div></div>)}</div></div></div></section>
    <section className="max-w-6xl mx-auto px-5 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{feat.map(([ic, t, d]) => <div key={t} className="card p-5 hover:shadow-lift transition"><div className="w-10 h-10 rounded-xl bg-navy-50 text-navy grid place-items-center"><Icon n={ic} /></div><h3 className="mt-3 font-bold text-navy">{t}</h3><p className="text-sm text-silver mt-1">{d}</p></div>)}</section>
    <footer className="border-t border-silver-200 py-8 text-center text-xs text-silver">© 2026 Kraud · Lagos · Abuja · Port Harcourt · Enugu · Umuahia</footer></div>);
}
