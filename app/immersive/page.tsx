import { searchText } from "@/lib/specs";
import type { Metadata, Viewport } from "next";
import { listings } from "@/lib/q";
import { currentUser } from "@/lib/auth";
import { track } from "@/lib/pricing";
import { photos } from "@/lib/photos";
import Feed, { type FeedItem } from "./Feed";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "For you · Kraud" };
export const viewport: Viewport = { themeColor: "#001a3d", viewportFit: "cover" };
export default async function Immersive({ searchParams }: { searchParams: Promise<{ id?: string; city?: string; hz?: string; mode?: string; q?: string }> }) {
  const s = await searchParams; const [all, u] = await Promise.all([listings({ ...(s.city && { city: s.city }), ...(s.hz === "short" ? { horizon: "SHORT_6M" } : s.hz === "long" ? { horizon: "LONG_12_18M" } : {}), ...(s.mode === "invest" ? { commerceMode: { in: ["INVEST", "BOTH"] } } : s.mode === "buy" ? { commerceMode: { in: ["BUY", "BOTH"] } } : {}) }), currentUser()]);
  const now = new Date();
  const { prisma } = await import("@/lib/db");
  const paid = new Set((await prisma.placement.findMany({ where: { slot: "immersive", status: "ACTIVE", endsAt: { gt: now } }, select: { listingId: true } })).map((p: any) => p.listingId));
  const isF = (l: (typeof all)[number]) => l.featured.includes("immersive") || paid.has(l.id);
  const qq = (s.q || "").toLowerCase().trim();
  let items = [...all.filter(isF), ...all.filter((l) => !isF(l))].filter((l) => !qq || qq.split(/\s+/).every((w) => `${l.title} ${l.estate} ${l.city} ${l.state} ${l.type} ${l.status} ${l.beds}-bed ${l.beds} beds ${l.baths} baths ${l.sqm} m2 ${l.sqm} m² ${searchText(l)}`.toLowerCase().includes(w)));
  if (s.id) { const i = items.findIndex((l) => l.id === s.id); if (i > 0) items = [items[i], ...items.slice(0, i), ...items.slice(i + 1)]; }
  const feed: FeedItem[] = items.map((l) => ({ id: l.id, title: l.title, price: l.price, city: l.city, state: l.state, estate: l.estate, desc: l.desc, beds: l.beds, baths: l.baths, sqm: l.sqm, kind: l.kind, attrs: l.attrs, videos: l.videos, status: l.status, type: l.type, seller: l.sellerName, sellerId: l.sellerId, imgs: photos(l), featured: isF(l), deal: l.deal, sellerImg: l.sellerImg }));
  const savedIds = u ? (await prisma.goal.findMany({ where: { userId: u.id, listingId: { not: null } }, select: { listingId: true } })).map((g) => g.listingId!) : [];
  if (feed.some((f) => f.featured)) await track("immersive", feed[0].city).catch(() => {});
  return <Feed items={feed} authed={!!u} me={u?.id ?? null} savedIds={savedIds} q={s.q || ""} />;
}
