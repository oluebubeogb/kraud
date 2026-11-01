import Icon from "@/components/Icon";
import { PageHead } from "@/components/Bits";
import { ActionButton } from "@/components/Ui";
import { load } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { wat } from "@/lib/format";
export default async function R() {
  const u = (await currentUser())!; const rs = load().reminders.filter((r) => r.userId === u.id);
  const upcoming = [["Inspection visit", "Saturday 10:00 WAT · bring ID"], ["Monthly savings nudge", "1st of every month"], ["Escrow release check", "7 days after payment"]];
  return (<div><PageHead title="Reminders" sub="Notifications and upcoming nudges" right={<ActionButton action="read-all" className="btn-ghost h-9 text-xs">Mark all read</ActionButton>} />
    <div className="px-4 lg:px-8 space-y-4 max-w-2xl"><div className="card divide-y divide-silver-200">{upcoming.map(([t, d]) => <div key={t} className="flex gap-3 p-4"><Icon n="bell" className="w-5 h-5 text-teal mt-0.5" /><div><div className="font-medium">{t}</div><div className="text-xs text-silver">{d}</div></div></div>)}</div>
      <h2 className="font-bold text-navy">Activity</h2>
      <div className="card divide-y divide-silver-200">{rs.length === 0 ? <div className="p-4 text-sm text-silver">Nothing yet.</div> : rs.map((r) => <div key={r.id} className="flex gap-3 p-4">{!r.read && <span className="mt-2 w-2 h-2 rounded-full bg-teal shrink-0" />}<div className={r.read ? "pl-5" : ""}><div className="font-medium">{r.title}</div><div className="text-sm text-navy/70">{r.body}</div><div className="text-[11px] text-silver mt-0.5">{wat(r.at)}</div></div></div>)}</div></div></div>);
}
