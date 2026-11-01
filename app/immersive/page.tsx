import type { Metadata, Viewport } from "next";
import { listings } from "@/lib/q";
import { currentUser } from "@/lib/auth";
import { track } from "@/lib/pricing";
import Feed, { type FeedItem } from "./Feed";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "For you · Kraud" };
export const viewport: Viewport = { themeColor: "#001a3d", viewportFit: "cover" };
export default async function Immersive({ searchParams }: { searchParams: Promise<{ id?: string; city?: string }> }) {
  const s = await searchParams; const [all, u] = await Promise.all([listings(s.city ? { city: s.city } : {}), currentUser()]);
  const now = new Date();
  const { prisma } = await import("@/lib/db");
  const paid = new Set((await prisma.placement.findMany({ where: { slot: "immersive", status: "ACTIVE", endsAt: { gt: now } }, select: { listingId: true } })).map((p: any) => p.listingId));
  const isF = (l: (typeof all)[number]) => l.featured.includes("immersive") || paid.has(l.id);
  let items = [...all.filter(isF), ...all.filter((l) => !isF(l))];
  if (s.id) { const i = items.findIndex((l) => l.id === s.id); if (i > 0) items = [items[i], ...items.slice(0, i), ...items.slice(i + 1)]; }
  const feed: FeedItem[] = items.map((l) => ({ id: l.id, title: l.title, price: l.price, city: l.city, state: l.state, estate: l.estate, desc: l.desc, beds: l.beds, baths: l.baths, sqm: l.sqm, status: l.status, type: l.type, seller: l.sellerName, sellerId: l.sellerId, imgs: [l.img, ...l.files.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f) && f !== l.img)], featured: isF(l) }));
  if (feed.some((f) => f.featured)) await track("immersive", feed[0].city).catch(() => {});
  return <Feed items={feed} authed={!!u} me={u?.id ?? null} />;
}
