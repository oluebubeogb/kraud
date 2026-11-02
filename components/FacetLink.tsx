"use client";
import { useRouter } from "next/navigation";
/** Facet click: immersive search on mobile, grid explore on desktop. */
export default function FacetLink({ q, className, children }: { q: string; className?: string; children: React.ReactNode }) {
  const r = useRouter();
  return <button type="button" className={className} onClick={() => { const m = window.matchMedia("(max-width: 1023px)").matches; r.push(`${m ? "/immersive" : "/explore"}?q=${encodeURIComponent(q)}`); }}>{children}</button>;
}
