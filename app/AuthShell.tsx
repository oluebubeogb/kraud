import Link from "next/link";
export default function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (<div className="min-h-[100dvh] grid lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12"><Link href="/" className="flex items-center gap-3"><img src="/mark.png" className="w-12 h-12" alt="" /><span className="text-2xl font-extrabold">kraud</span></Link><div><h2 className="text-4xl font-extrabold leading-tight">Verified property.<br />Escrow-protected.<br /><span className="text-[#7FC4BD]">Nationwide.</span></h2><p className="mt-4 text-white/70 max-w-sm">Lagos · Abuja · Port Harcourt · Enugu · Umuahia</p></div><p className="text-xs text-white/50">Payments by Monnify · NDPR-aligned data handling</p></div>
    <div className="flex flex-col justify-center px-5 py-10 sm:px-12"><div className="w-full max-w-sm mx-auto"><Link href="/" className="lg:hidden flex items-center gap-2 mb-8"><img src="/icons/icon-192.png" className="w-10 h-10 rounded-xl" alt="" /><span className="text-xl font-extrabold text-navy">kraud</span></Link>
      <h1 className="text-2xl font-extrabold text-navy">{title}</h1><p className="text-sm text-silver mt-1 mb-6">{sub}</p>{children}</div></div></div>);
}
