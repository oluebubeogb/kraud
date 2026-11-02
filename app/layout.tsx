import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = { title: "Kraud — Own Together. Grow Together.", description: "Co-own units in verified Nigerian property, or buy the whole home. Insured, diligence-checked, paid via Monnify.", manifest: "/manifest.json", icons: { icon: "/icons/icon-32.png", apple: "/icons/apple-180.png" }, appleWebApp: { capable: true, title: "Kraud", statusBarStyle: "default" } };
export const viewport: Viewport = { themeColor: "#002454", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en-NG"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" /></head><body className="font-sans antialiased">{children}
    <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(r=>r.update()))}` }} /></body></html>);
}
