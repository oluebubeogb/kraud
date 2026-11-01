import { notFound } from "next/navigation";
import { PageHead } from "@/components/Bits";
import { ActionButton } from "@/components/Ui";
import { currentUser, isAdmin } from "@/lib/auth";
import { DATA_DIR, load } from "@/lib/db";
import { quote, SLOTS } from "@/lib/listings";
import { naira, nairaShort } from "@/lib/format";
export default async function A() {
  const u = await currentUser(); if (!isAdmin(u)) notFound(); const db = load(); const seeded = db.listings.filter((l) => l.seed).length;
  const cities = ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Umuahia"];
  return (<div><PageHead title="Admin" sub="Primary admins are set via KRAUD_ADMINS env" />
    <div className="px-4 lg:px-8 space-y-5">
      <div className="card p-4 space-y-3"><h2 className="font-bold text-navy">Demo seed data</h2><p className="text-sm text-silver">Writes {seeded ? seeded : "11"} listings + cover/meta files to <code className="text-navy">{DATA_DIR}/uploads/seed</code>. Remove deletes the rows and the files. Real user uploads are never touched.</p>
        <div className="flex flex-wrap gap-3"><ActionButton action="seed-add" className="btn-teal">Seed demo data</ActionButton><ActionButton action="seed-remove" className="btn-ghost" confirm="Remove all seeded listings and their files?">Remove seed data</ActionButton></div>
        <div className="text-xs text-silver">Seeded listings: {seeded} · Seed files on volume: {db.seedFiles.length} · Users: {db.users.length}</div></div>
      <div className="card overflow-x-auto"><div className="p-4"><h2 className="font-bold text-navy">Featured placement pricing (daily, forecast)</h2><p className="text-xs text-silver">Meta-style: forecast impressions × slot CPM, unique per slot & city, floored by admin minimum ₦15,000/day.</p></div>
        <table className="w-full text-sm"><thead><tr className="text-left text-silver text-xs"><th className="px-4 py-2">Slot</th>{cities.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}</tr></thead>
          <tbody>{SLOTS.map((s) => <tr key={s} className="border-t border-silver-200"><td className="px-4 py-2 font-medium capitalize text-navy">{s}</td>{cities.map((c) => { const q = quote(s, c); return <td key={c} className="px-3 py-2 whitespace-nowrap">{naira(q.daily)}<div className="text-[10px] text-silver">{q.impressions.toLocaleString()} imp</div></td>; })}</tr>)}</tbody></table></div>
      <div className="card"><div className="p-4"><h2 className="font-bold text-navy">Listings moderation</h2></div><div className="divide-y divide-silver-200">{db.listings.map((l) => <div key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"><div className="flex-1 min-w-[12rem]"><div className="font-medium">{l.title}</div><div className="text-xs text-silver">{l.city} · {nairaShort(l.price)} · {l.featured?.length ? "Featured: " + l.featured.join(", ") : "No placement"}{l.seed ? " · seed" : ""}</div></div><span className={`chip ${l.moderation === "Hidden" ? "bg-silver-200 text-navy" : "bg-teal-50 text-teal"}`}>{l.moderation}</span><ActionButton action="moderate" body={{ id: l.id, status: l.moderation === "Hidden" ? "Approved" : "Hidden" }} className="btn-ghost h-9 text-xs">{l.moderation === "Hidden" ? "Approve" : "Hide"}</ActionButton></div>)}{db.listings.length === 0 && <div className="p-4 text-sm text-silver">No listings — seed demo data above.</div>}</div></div>
    </div></div>);
}
