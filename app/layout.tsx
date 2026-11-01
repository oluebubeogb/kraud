import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = { title: "Kraud — Own property across Nigeria", description: "Buy, save toward and invest in verified Nigerian property with escrow protection.", manifest: "/manifest.json", icons: { icon: "/icons/icon-32.png", apple: "/icons/apple-180.png" }, appleWebApp: { capable: true, title: "Kraud", statusBarStyle: "default" } };
export const viewport: Viewport = { themeColor: "#002454", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en-NG"><body className="font-sans antialiased">{children}
    <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(r=>r.update()))}` }} /></body></html>);
}
