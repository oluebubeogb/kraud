import { redirect } from "next/navigation";
import { currentUser, isAdmin } from "@/lib/auth";
import { BottomNav, SideNav } from "@/components/Nav";
import { VerifyBanner } from "@/components/Client";
export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser(); if (!u) redirect("/login"); const seller = u.role === "SELLER";
  return (<div className="lg:flex min-h-screen"><SideNav admin={isAdmin(u)} seller={seller} />
    <main className="flex-1 min-w-0 pb-safe">{!u.verified && <VerifyBanner email={u.email} />}{children}</main><BottomNav seller={seller} /></div>);
}
