"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { post, PasswordInput } from "./Ui";
import Icon from "./Icon";
import { naira } from "@/lib/format";
export function VerifyBanner({ email }: { email: string }) {
  const [link, setLink] = useState(""); const [sent, setSent] = useState(false);
  return (<div className="mx-4 lg:mx-8 mt-3 rounded-xl bg-navy text-white px-4 py-3 text-sm flex flex-wrap items-center gap-2">
    <Icon n="shield" className="w-4 h-4 text-teal-50" /><span className="flex-1 min-w-[12rem]">Verify <b>{email}</b> to unlock buying & withdrawals.</span>
    <button className="underline underline-offset-2" onClick={async () => { const d = await post("resend-verify", {}); setSent(true); if (d.devLink) setLink(d.devLink); }}>{sent ? "Sent ✓" : "Resend"}</button>
    {link && <a href={link} className="chip bg-teal text-white">Dev: open verify</a>}</div>);
}
export function useForm(action: string, onOk: (d: any) => void) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setBusy(true); setError(""); try { onOk(await post(action, Object.fromEntries(new FormData(e.currentTarget)))); } catch (x: any) { setError(x.message); } setBusy(false); };
  return { error, busy, onSubmit };
}
export const Err = ({ e }: { e: string }) => e ? <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{e}</p> : null;
export function LoginForm() {
  const r = useRouter(); const f = useForm("login", () => { r.push("/explore"); r.refresh(); });
  return (<form onSubmit={f.onSubmit} className="space-y-4">
    <label className="block"><span className="label">Username or email</span><input name="id" className="input mt-1.5" placeholder="ada or ada@kraud.ng" autoCapitalize="none" required /></label>
    <PasswordInput help={false} /><Err e={f.error} />
    <button className="btn-primary w-full" disabled={f.busy}>{f.busy ? "Signing in…" : "Sign in"}</button>
    <div className="flex justify-between text-sm"><Link href="/forgot" className="text-teal font-medium">Forgot passphrase?</Link><Link href="/signup" className="text-navy font-medium">Create account</Link></div></form>);
}
export function SignupForm() {
  const r = useRouter(); const [dev, setDev] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const f = useForm("signup", (d) => { if (d.devLink) setDev(d.devLink); else { r.push("/explore"); r.refresh(); } });
  if (dev) return (<div className="space-y-4 text-center"><div className="mx-auto w-14 h-14 rounded-full bg-teal-50 text-teal grid place-items-center"><Icon n="check" className="w-7 h-7" /></div><h2 className="text-lg font-bold text-navy">Check your email</h2><p className="text-sm text-silver">We sent a Nigerian-word verification phrase. SMTP is not configured on this dev server, so use the dev link:</p><a href={dev} className="btn-teal w-full">Dev: open verify link</a><Link href="/explore" className="btn-ghost w-full">Skip for now</Link></div>);
  return (<form onSubmit={f.onSubmit} className="space-y-4">
    <input type="hidden" name="role" value={role} /><div className="grid grid-cols-2 gap-2 rounded-xl bg-silver-200/60 p-1">{(["BUYER", "SELLER"] as const).map((x) => <button type="button" key={x} onClick={() => setRole(x)} className={`h-10 rounded-lg text-sm font-semibold ${role === x ? "bg-white text-navy shadow-card" : "text-silver"}`}>{x === "BUYER" ? "Buy / invest" : "Sell / develop"}</button>)}</div>
    <label className="block"><span className="label">Full name</span><input name="name" className="input mt-1.5" placeholder="Ada Okafor" required /></label>
    {role === "SELLER" && <label className="block"><span className="label">Business / developer name</span><input name="businessName" className="input mt-1.5" placeholder="Umuahia Estates Ltd" required /></label>}
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Username</span><input name="username" className="input mt-1.5" placeholder="ada" autoCapitalize="none" required /></label>
    <label className="block"><span className="label">Email</span><input name="email" type="email" className="input mt-1.5" placeholder="ada@mail.ng" required /></label></div>
    <PasswordInput /><Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy}>{f.busy ? "Creating…" : "Create account"}</button>
    <p className="text-center text-sm">Have an account? <Link href="/login" className="text-teal font-medium">Sign in</Link></p></form>);
}
export function VerifyForm({ u, p }: { u: string; p: string }) {
  const [state, setState] = useState<"busy" | "ok" | string>("busy");
  useEffect(() => { post("verify", { u, p }).then(() => setState("ok")).catch((e) => setState(e.message)); }, [u, p]);
  return state === "busy" ? <p className="text-center text-silver">Verifying…</p> : state === "ok" ? (<div className="text-center space-y-4"><div className="mx-auto w-14 h-14 rounded-full bg-teal-50 text-teal grid place-items-center"><Icon n="check" className="w-7 h-7" /></div><h2 className="font-bold text-navy text-lg">Email verified</h2><Link href="/explore" className="btn-primary w-full">Continue to Kraud</Link></div>) : <Err e={state} />;
}
export function ForgotForm() {
  const [step, setStep] = useState<"ask" | "reset" | "done">("ask"); const [id, setId] = useState(""); const [dev, setDev] = useState("");
  const a = useForm("forgot", (d) => { setStep("reset"); if (d.devPhrase) setDev(d.devPhrase); });
  const b = useForm("reset", () => setStep("done"));
  if (step === "done") return <div className="text-center space-y-4"><h2 className="font-bold text-navy text-lg">Passphrase updated</h2><Link href="/login" className="btn-primary w-full">Sign in</Link></div>;
  if (step === "reset") return (<form onSubmit={b.onSubmit} className="space-y-4"><input type="hidden" name="id" value={id} />
    <p className="text-sm text-silver">We emailed a 2-word Nigerian reset phrase. It expires in <b className="text-navy">15 minutes</b>.</p>
    {dev && <p className="chip bg-teal-50 text-teal">Dev (SMTP off): {dev}</p>}
    <PasswordInput name="phrase" label="Reset phrase" placeholder="e.g. suya kano" help={false} /><PasswordInput label="New passphrase" /><Err e={b.error} /><button className="btn-primary w-full">Reset passphrase</button></form>);
  return (<form onSubmit={(e) => { setId(String(new FormData(e.currentTarget).get("id"))); a.onSubmit(e); }} className="space-y-4">
    <label className="block"><span className="label">Username or email</span><input name="id" className="input mt-1.5" required autoCapitalize="none" /></label><Err e={a.error} /><button className="btn-primary w-full">Send reset phrase</button></form>);
}
export function Checkout({ id, price, title, blocked, mode: payMode }: { id: string; price: number; title: string; blocked?: React.ReactNode; mode: string }) {
  const [mode, setMode] = useState<"full" | "deposit">("deposit"); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const amt = mode === "deposit" ? Math.round(price * 0.3) : price; const fee = Math.min(Math.round(amt * 0.015), 2_000_000);
  const pay = async () => { setBusy(true); setErr(""); try { const d = await post("pay", { listingId: id, mode }); window.location.href = d.checkoutUrl; } catch (e: any) { setErr(e.message); setBusy(false); } };
  if (blocked) return <>{blocked}</>;
  return (<div className="space-y-4">
    <div className="card p-4 space-y-2"><span className="label">Payment</span>
      {(["deposit", "full"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`w-full flex justify-between items-center rounded-xl border px-4 h-14 text-sm ${mode === m ? "border-navy bg-navy-50" : "border-silver-200"}`}><span className="font-medium">{m === "deposit" ? "30% deposit (escrow)" : "Pay in full (escrow)"}</span><b className="text-navy">{naira(m === "deposit" ? price * 0.3 : price)}</b></button>)}</div>
    <div className="card p-4 text-sm space-y-1.5"><div className="flex justify-between"><span className="text-silver">Amount</span><span>{naira(amt)}</span></div><div className="flex justify-between"><span className="text-silver">Escrow fee (1.5%, capped)</span><span>{naira(fee)}</span></div><div className="flex justify-between font-bold text-navy pt-2 border-t border-silver-200"><span>Total</span><span>{naira(amt + fee)}</span></div></div>
    <Err e={err} /><button className="btn-primary w-full h-12" disabled={busy} onClick={pay}><Icon n="lock" className="w-4 h-4" />{busy ? "Opening Monnify…" : "Pay securely with Monnify"}</button>
    <p className="text-[11px] text-center text-silver">Card · Bank transfer · USSD — {payMode === "live" ? "live" : payMode === "sandbox" ? "Monnify sandbox" : payMode === "simulator" ? "local simulator (no Monnify keys)" : "not configured"}</p>
  </div>);
}
export function PayRedirect({ action, body, label, className = "btn-primary" }: { action: string; body: unknown; label: React.ReactNode; className?: string }) {
  const [busy, setBusy] = useState(false); const [e, setE] = useState("");
  return (<span className="inline-flex flex-col"><button disabled={busy} className={className} onClick={async () => { setBusy(true); setE(""); try { const d = await post(action, body); window.location.href = d.checkoutUrl; } catch (x: any) { setE(x.message); setBusy(false); } }}>{busy ? "Opening Monnify…" : label}</button>{e && <span className="text-xs text-red-700 mt-1">{e}</span>}</span>);
}
export function SimulatePay({ reference, amount, title }: { reference: string; amount: number; title: string }) {
  const r = useRouter(); const [method, setMethod] = useState("Bank Transfer"); const [busy, setBusy] = useState(false); const [e, setE] = useState("");
  return (<div className="bg-white w-full sm:max-w-md mx-auto rounded-3xl p-5 space-y-4 shadow-lift">
    <div className="flex items-center justify-between"><div className="font-extrabold text-[#0B1B33]">monnify<span className="text-[#F0AA22]">.</span></div><span className="chip bg-silver-200 text-navy">LOCAL SIMULATOR</span></div>
    <div className="rounded-xl bg-paper p-3 text-sm"><div className="text-silver text-xs">Kraud · {title}</div><div className="text-2xl font-bold text-navy">{naira(amount)}</div><div className="text-[11px] text-silver font-mono">{reference}</div></div>
    <div className="grid grid-cols-3 gap-2">{["Bank Transfer", "Card", "USSD"].map((m) => <button key={m} onClick={() => setMethod(m)} className={`rounded-xl border h-11 text-xs font-semibold ${method === m ? "border-navy bg-navy-50 text-navy" : "border-silver-200"}`}>{m}</button>)}</div>
    <p className="text-xs text-silver">Shown only when MONNIFY_* keys are empty and NODE_ENV is not production. Add sandbox keys to use the real Monnify checkout.</p><Err e={e} />
    <button className="btn-teal w-full h-12" disabled={busy} onClick={async () => { setBusy(true); try { const d = await post("sim-pay", { ref: reference, method }); r.push("/receipt/" + d.ref); } catch (x: any) { setE(x.message); setBusy(false); } }}>{busy ? "Confirming…" : "Approve test payment"}</button></div>);
}
export function ChatBox({ id, me, msgs, placeholder = "Message…" }: { id: string; me: string; msgs: { from: string; text: string; at: number }[]; placeholder?: string }) {
  const r = useRouter(); const [t, setT] = useState(""); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView(); post("chat-read", { id }).catch(() => {}); }, [msgs.length, id]);
  useEffect(() => { const i = setInterval(() => { if (document.visibilityState === "visible") r.refresh(); }, 5000); return () => clearInterval(i); }, [r]);
  return (<div className="flex flex-col h-[calc(100dvh-140px)] lg:h-[calc(100vh-90px)]">
    <div className="flex-1 overflow-y-auto px-4 space-y-2 py-3">{msgs.length === 0 && <p className="text-center text-sm text-silver py-8">Say hello — this is a private 1-on-1 conversation.</p>}{msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] whitespace-pre-wrap break-words ${m.from === me ? "ml-auto bg-navy text-white rounded-br-sm" : "bg-white shadow-card rounded-bl-sm"}`}>{m.text}<div className={`text-[10px] mt-0.5 ${m.from === me ? "text-white/60" : "text-silver"}`}>{new Date(m.at).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" })}</div></div>)}<div ref={end} /></div>
    <form className="flex gap-2 p-3 bg-white border-t border-silver-200" style={{ paddingBottom: "max(env(safe-area-inset-bottom),12px)" }} onSubmit={async (e) => { e.preventDefault(); if (!t.trim()) return; const x = t; setT(""); await post("chat-send", { id, text: x }).catch((er) => alert(er.message)); r.refresh(); }}>
      <input value={t} onChange={(e) => setT(e.target.value)} className="input" placeholder={placeholder} maxLength={1000} /><button className="btn-primary w-12 px-0" aria-label="Send"><Icon n="send" /></button></form></div>);
}
export function KycForm() {
  const r = useRouter(); const [st, setSt] = useState(""); const f = useForm("kyc", (d) => { setSt(d.status); r.refresh(); });
  if (st === "PENDING_REVIEW") return <p className="chip bg-silver-200 text-navy">Submitted — under review</p>;
  return (<form onSubmit={f.onSubmit} className="space-y-3">
    <label className="block"><span className="label">Full legal name (as on BVN)</span><input name="legalName" className="input mt-1.5" placeholder="Ada Chioma Okafor" required /></label>
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Date of birth</span><input name="dob" type="date" className="input mt-1.5" required /></label><label className="block"><span className="label">Phone</span><input name="phone" inputMode="tel" className="input mt-1.5" placeholder="0803…" required /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">NIN</span><input name="nin" inputMode="numeric" maxLength={11} pattern="\d{11}" className="input mt-1.5" placeholder="11 digits" required /></label>
    <label className="block"><span className="label">BVN</span><input name="bvn" inputMode="numeric" maxLength={11} pattern="\d{11}" className="input mt-1.5" placeholder="11 digits" required /></label></div>
    <Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy}>{f.busy ? "Checking…" : "Verify identity (one-off)"}</button><p className="text-xs text-silver">Encrypted at rest; only the last 4 digits are ever shown. Asked once — never again.</p></form>);
}
export function TopUp({ id }: { id: string }) {
  return (<div className="flex gap-2">{[50000, 250000, 1000000].map((a) => <PayRedirect key={a} action="topup" body={{ id, amount: a }} className="btn-ghost w-full px-2 text-xs" label={"+" + naira(a)} />)}</div>);
}
export const BANKS: [string, string][] = [["044", "Access Bank"], ["023", "Citibank"], ["050", "Ecobank"], ["070", "Fidelity Bank"], ["011", "First Bank"], ["214", "FCMB"], ["058", "GTBank"], ["030", "Heritage"], ["082", "Keystone"], ["50515", "Moniepoint MFB"], ["999992", "OPay"], ["999991", "PalmPay"], ["076", "Polaris"], ["221", "Stanbic IBTC"], ["232", "Sterling"], ["032", "Union Bank"], ["033", "UBA"], ["035", "Wema Bank"], ["057", "Zenith Bank"]];
export function Withdraw({ goalId, amount }: { goalId: string; amount: number }) {
  const r = useRouter(); const [open, setOpen] = useState(false); const [dev, setDev] = useState(""); const [exp, setExp] = useState(0); const [left, setLeft] = useState(0); const [e, setE] = useState("");
  const f = useForm("withdraw", () => { setOpen(false); r.refresh(); });
  useEffect(() => { if (!exp) return; const i = setInterval(() => setLeft(Math.max(0, exp - Date.now())), 1000); return () => clearInterval(i); }, [exp]);
  if (!amount) return null;
  if (!open) return <><button className="btn-ghost w-full" onClick={async () => { setE(""); try { const d = await post("2fa-send", {}); setOpen(true); setExp(d.exp); if (d.devPhrase) setDev(d.devPhrase); } catch (x: any) { setE(x.message); } }}><Icon n="lock" className="w-4 h-4" />Withdraw {naira(amount)} (2FA)</button><Err e={e} /></>;
  return (<form onSubmit={f.onSubmit} className="space-y-3 rounded-xl bg-paper p-3"><input type="hidden" name="goalId" value={goalId} />
    <p className="text-sm">We emailed a Nigerian 2-word phrase. Expires in <b className="text-navy font-mono">{Math.floor(left / 60000)}:{String(Math.floor(left / 1000) % 60).padStart(2, "0")}</b></p>
    {dev && <p className="chip bg-teal-50 text-teal">Dev (SMTP off): {dev}</p>}
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Bank</span><select name="bankCode" className="input mt-1.5" required>{BANKS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label><label className="block"><span className="label">Account no.</span><input name="accountNumber" inputMode="numeric" maxLength={10} className="input mt-1.5" placeholder="10 digits" required /></label></div>
    <PasswordInput name="phrase" label="2FA phrase" placeholder="e.g. owambe kano" help={false} /><Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy}>Confirm withdrawal</button></form>);
}
function F({ l, n, label, type = "text", ph }: { l?: any; n: string; label: string; type?: string; ph?: string }) { return <label className="block"><span className="label">{label}</span><input name={n} type={type} defaultValue={l?.[n]} placeholder={ph} className="input mt-1.5" required /></label>; }
export function ListingForm({ l, states }: { l?: any; states: string[] }) {
  const r = useRouter(); const [img, setImg] = useState<string>(l?.img || ""); const [up, setUp] = useState(""); const f = useForm("listing-save", () => { r.push("/seller"); r.refresh(); });
  const upload = async (file: File) => { setUp("Uploading…"); const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/upload", { method: "POST", body: fd }); const d = await res.json(); if (!res.ok) return setUp(d.error); setImg(d.url); setUp(""); };
  return (<form onSubmit={f.onSubmit} className="space-y-3">{l && <input type="hidden" name="id" value={l.id} />}<input type="hidden" name="img" value={img} />
    <label className="block rounded-2xl border border-dashed border-silver overflow-hidden cursor-pointer">{img ? <img src={img} alt="" className="w-full h-48 object-cover" /> : <div className="h-40 grid place-items-center text-sm text-silver">Tap to upload cover photo (JPG/PNG/WEBP, 8 MB)</div>}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>{up && <p className="text-xs text-silver">{up}</p>}
    <F l={l} n="title" label="Title" ph="4-Bed Detached Duplex" />
    <div className="grid grid-cols-2 gap-3"><F l={l} n="city" label="City / town" ph="Umuahia" /><label className="block"><span className="label">State</span><select name="state" defaultValue={l?.state || "Lagos"} className="input mt-1.5">{states.map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <F l={l} n="estate" label="Estate / area" ph="Kraud Gardens, Ubakala Rd" />
    <div className="grid grid-cols-2 gap-3"><F l={l} n="price" label="Price (₦)" type="number" /><label className="block"><span className="label">Stage</span><select name="status" defaultValue={l?.status || "Completed"} className="input mt-1.5">{["Completed", "Carcass", "Off-plan"].map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <div className="grid grid-cols-4 gap-3"><F l={l} n="beds" label="Beds" type="number" /><F l={l} n="baths" label="Baths" type="number" /><F l={l} n="sqm" label="m²" type="number" /><F l={l} n="type" label="Type" ph="Duplex" /></div>
    <label className="block"><span className="label">Description</span><textarea name="desc" defaultValue={l?.desc} rows={4} className="input mt-1.5 h-auto py-2" required /></label>
    <Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy}>{l ? "Save & resubmit for review" : "Submit for review"}</button><p className="text-xs text-silver">Listings go live after Kraud moderation (title documents check).</p></form>);
}
export function PlacementBooker({ listings, quotes }: { listings: { id: string; title: string; city: string }[]; quotes: Record<string, Record<string, { daily: number; impressions: number }>> }) {
  const [lid, setLid] = useState(listings[0]?.id || ""); const [slot, setSlot] = useState("search"); const [days, setDays] = useState(7);
  const l = listings.find((x) => x.id === lid); const q = l ? quotes[slot]?.[l.city] : undefined; const daily = q?.daily ?? 0;
  if (!listings.length) return <p className="text-sm text-silver">Get a listing approved to book Featured placements.</p>;
  return (<div className="space-y-3"><select className="input" value={lid} onChange={(e) => setLid(e.target.value)}>{listings.map((x) => <option key={x.id} value={x.id}>{x.title} · {x.city}</option>)}</select>
    <div className="flex gap-2 overflow-x-auto no-scrollbar">{["search", "sidebar", "immersive", "footer", "recommended"].map((s) => <button key={s} onClick={() => setSlot(s)} className={`chip h-9 px-4 capitalize shrink-0 ${slot === s ? "bg-navy text-white" : "bg-white border border-silver-200 text-navy"}`}>{s}</button>)}</div>
    <div className="flex items-center gap-3"><input type="range" min={1} max={30} value={days} onChange={(e) => setDays(+e.target.value)} className="flex-1 accent-[#1F7A72]" /><span className="text-sm w-16 text-right">{days} days</span></div>
    <div className="rounded-xl bg-paper p-3 text-sm"><div className="flex justify-between"><span className="text-silver">Forecast reach</span><b>{q ? Math.round(q.impressions / 7 * days).toLocaleString() : "—"} impressions</b></div><div className="flex justify-between"><span className="text-silver">Daily rate</span><b>{naira(daily)}</b></div><div className="flex justify-between text-navy font-bold pt-1 border-t border-silver-200 mt-1"><span>Total</span><span>{naira(daily * days)}</span></div></div>
    <PayRedirect action="placement-book" body={{ listingId: lid, slot, days }} className="btn-teal w-full" label="Book & pay with Monnify" /></div>);
}
export function MinRate({ slot, value }: { slot: string; value: number }) {
  const r = useRouter(); const [v, setV] = useState(String(value)); const [busy, setBusy] = useState(false);
  return (<form className="flex gap-1" onSubmit={async (e) => { e.preventDefault(); setBusy(true); await post("min-rate", { slot, value: +v }).catch((x) => alert(x.message)); setBusy(false); r.refresh(); }}><input value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric" className="input h-8 w-24 text-xs px-2" /><button className="btn-ghost h-8 px-2 text-xs" disabled={busy}>Set</button></form>);
}
