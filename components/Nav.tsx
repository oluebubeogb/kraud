"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
const TABS = [["/explore", "Home", "home"], ["/investments", "Portfolio", "chart"], ["/savings", "Savings", "piggy"], ["/chat", "Chat", "chat"], ["/profile", "Profile", "user"]] as const;
const SELLER_TABS = [["/explore", "Home", "home"], ["/seller", "Seller", "grid"], ["/investments", "Portfolio", "chart"], ["/chat", "Chat", "chat"], ["/profile", "Profile", "user"]] as const;
export function BottomNav({ seller }: { seller?: boolean }) {
  const p = usePathname(); const tabs = (seller ? SELLER_TABS : TABS).map((t) => t[0] === "/explore" ? (["/immersive", "Discover", "expand"] as const) : t);
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-silver-200" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-5 h-16">
        {tabs.map(([href, label, ic]) => { const on = p.startsWith(href) || (href === "/immersive" && p.startsWith("/explore")); return (
          <Link key={href} href={href} className={`flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium ${on ? "text-navy" : "text-silver"}`}>
            <span className={`grid place-items-center w-12 h-7 rounded-full transition ${on ? "bg-navy-50" : ""}`}><Icon n={ic} className="w-[22px] h-[22px]" /></span>{label}
          </Link>); })}
      </div>
    </nav>
  );
}
export function SideNav({ admin, seller }: { admin: boolean; seller?: boolean }) {
  const p = usePathname();
  const items = [...TABS, ...(seller ? [["/seller", "Seller dashboard", "grid"]] : []), ["/reminders", "Reminders", "bell"], ...(admin ? [["/admin", "Admin", "shield"]] : [])] as [string, string, string][];
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-silver-200 bg-white h-screen sticky top-0 p-4">
      <Link href="/" className="flex items-center gap-2 px-2 py-3"><img src="/logo.png" alt="Kraud" className="h-9 w-auto" /></Link>
      <div className="mt-4 space-y-1">{items.map(([href, label, ic]) => (
        <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 h-11 text-sm font-medium ${p.startsWith(href) ? "bg-navy text-white" : "text-navy hover:bg-navy-50"}`}><Icon n={ic} />{label}</Link>))}</div>
      <div className="mt-auto text-[11px] text-silver px-2">Own Together. Grow Together.</div>
    </aside>
  );
}
