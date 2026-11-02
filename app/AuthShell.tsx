import Trust from "@/components/Trust";
import Link from "next/link";
import Tip from "@/components/Tip";
export default function AuthShell({ title, sub, tip, children }: { title: string; sub?: string; tip?: string; children: React.ReactNode }) {
  return (<div className="min-h-[100dvh] grid lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12"><Link href="/" className="flex items-center gap-3"><img src="/logo-white.png" className="h-12 w-auto" alt="Kraud" /></Link><div><h2 className="text-3xl font-extrabold leading-tight">Verified property.<br />Escrow-protected.<br /><span className="text-[#7FC4BD]">Nationwide.</span></h2><div className="mt-6"><Trust dark /></div></div><p className="text-xs text-white/50">Payments by Monnify · NDPR-aligned data handling</p></div>
    <div className="flex flex-col justify-center px-5 py-10 sm:px-12"><div className="w-full max-w-sm mx-auto"><Link href="/" className="lg:hidden flex items-center gap-2 mb-8"><img src="/icons/icon-192.png" className="w-10 h-10 rounded-xl" alt="" /><span className="text-xl font-extrabold text-navy">kraud</span></Link>
      <h1 className="text-xl font-bold tracking-tight text-navy flex items-center gap-2">{title}{tip && <Tip text={tip} />}</h1>{sub ? <p className="text-sm text-silver mt-1 mb-6">{sub}</p> : <div className="mb-6" />}{children}<div className="mt-8 lg:hidden"><Trust compact /></div></div></div></div>);
}
