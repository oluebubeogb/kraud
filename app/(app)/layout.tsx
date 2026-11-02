import Link from "next/link";
import { currentUser, isAdmin } from "@/lib/auth";
import { BottomNav, SideNav } from "@/components/Nav";
import { HeaderToggle } from "@/components/HeaderToggle";
import { VerifyBanner } from "@/components/Client";
export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  if (!u) return (<div className="min-h-screen"><header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-silver-200"><div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2"><Link href="/" className="flex items-center gap-2"><img src="/icons/icon-192.png" alt="" className="w-8 h-8 rounded-lg" /><span className="text-lg font-extrabold text-navy">Kraud</span></Link><div className="ml-auto flex items-center gap-2"><HeaderToggle /><Link href="/login" className="btn-primary h-9">Sign in</Link></div></div></header><main className="max-w-6xl mx-auto pb-safe">{children}</main></div>);
 const seller = u.role === "SELLER";
  return (<div className="lg:flex min-h-screen"><SideNav admin={isAdmin(u)} seller={seller} />
    <main className="flex-1 min-w-0 pb-safe">{!u.verified && <VerifyBanner email={u.email} />}{children}</main><BottomNav seller={seller} /></div>);
}
