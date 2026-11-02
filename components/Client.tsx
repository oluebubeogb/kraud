"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { post, PasswordInput } from "./Ui";
import Icon from "./Icon";
import { naira } from "@/lib/format";
import Tip from "./Tip";
import { calcFees, type FeeCfg } from "@/lib/deal";
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
    <div className="flex justify-between text-sm"><Link href="/forgot" className="text-teal font-medium">Forgot password?</Link><Link href="/signup" className="text-navy font-medium">Create account</Link></div></form>);
}
export function SignupForm({ ref0 = "" }: { ref0?: string }) {
  const r = useRouter(); const [dev, setDev] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const f = useForm("signup", (d) => { if (d.devLink) setDev(d.devLink); else { r.push("/explore"); r.refresh(); } });
  if (dev) return (<div className="space-y-4 text-center"><div className="mx-auto w-14 h-14 rounded-full bg-teal-50 text-teal grid place-items-center"><Icon n="check" className="w-7 h-7" /></div><h2 className="text-lg font-bold text-navy">Check your email</h2><p className="text-sm text-silver inline-flex items-center gap-1.5 justify-center">We sent a verification phrase <Tip text="SMTP is not configured on this dev server, so use the dev link below." /></p><a href={dev} className="btn-teal w-full">Dev: open verify link</a><Link href="/explore" className="btn-ghost w-full">Skip for now</Link></div>);
  return (<form onSubmit={f.onSubmit} className="space-y-4">
    <input type="hidden" name="role" value={role} /><input type="hidden" name="ref" value={ref0} />{ref0 && <p className="chip wash-coral"><Icon n="gift" className="w-3.5 h-3.5" />Invited with code {ref0}</p>}<div className="grid grid-cols-2 gap-2 rounded-xl bg-silver-200/60 p-1">{(["BUYER", "SELLER"] as const).map((x) => <button type="button" key={x} onClick={() => setRole(x)} className={`h-10 rounded-lg text-sm font-semibold ${role === x ? "bg-white text-navy shadow-card" : "text-silver"}`}>{x === "BUYER" ? "Buy / invest" : "Sell / develop"}</button>)}</div><p className="flex items-center gap-1.5 text-[12px] text-silver -mt-2">{role === "BUYER" ? "Buyer / investor" : "Seller / developer"}<Tip text={role === "BUYER" ? "Co-own units from one share, or buy a whole property. Save toward a listing or a personal vault." : "Publish verified listings. A profile photo or logo is required before you publish."} /></p>
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
  if (step === "done") return <div className="text-center space-y-4"><h2 className="font-bold text-navy text-lg">Password updated</h2><Link href="/login" className="btn-primary w-full">Sign in</Link></div>;
  if (step === "reset") return (<form onSubmit={b.onSubmit} className="space-y-4"><input type="hidden" name="id" value={id} />
    <p className="text-sm text-silver">We emailed a 2-word Nigerian reset phrase. It expires in <b className="text-navy">15 minutes</b>.</p>
    {dev && <p className="chip bg-teal-50 text-teal">Dev (SMTP off): {dev}</p>}
    <PasswordInput name="phrase" label="Reset phrase" placeholder="e.g. suya kano" help={false} /><PasswordInput label="New password" /><Err e={b.error} /><button className="btn-primary w-full">Reset password</button></form>);
  return (<form onSubmit={(e) => { setId(String(new FormData(e.currentTarget).get("id"))); a.onSubmit(e); }} className="space-y-4">
    <label className="block"><span className="label">Username or email</span><input name="id" className="input mt-1.5" required autoCapitalize="none" /></label><Err e={a.error} /><button className="btn-primary w-full">Send reset phrase</button></form>);
}
export function Checkout({ id, kind, unit, seatsLeft, profitPerUnit, price, cfg, insurer, wallet, blocked, mode: payMode }: { id: string; kind: "invest" | "buy"; unit: number; seatsLeft: number; profitPerUnit: number; price: number; cfg: FeeCfg; insurer: string; wallet: number; blocked?: React.ReactNode; mode: string }) {
  const [units, setUnits] = useState(1); const [method, setMethod] = useState<"monnify" | "wallet">("monnify"); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const invest = kind === "invest"; const amt = invest ? unit * units : price; const f = calcFees(cfg, amt, invest ? "INVEST" : "PURCHASE", units); const total = amt + f.total;
  const pay = async () => { setBusy(true); setErr(""); try { const d = await post("pay", { listingId: id, mode: kind, units, method }); window.location.href = d.checkoutUrl; } catch (e: any) { setErr(e.message); setBusy(false); } };
  if (blocked) return <>{blocked}</>;
  const row = (k: React.ReactNode, v: string, strong?: boolean) => <div className={`flex justify-between items-center ${strong ? "font-bold text-navy pt-2 border-t border-silver-200" : ""}`}><span className={strong ? "" : "text-silver flex items-center gap-1.5"}>{k}</span><span>{v}</span></div>;
  return (<div className="space-y-4">
    {invest && <div className="card p-4 k-pop"><div className="flex items-center justify-between"><span className="label">Units</span><span className="text-xs text-silver">{seatsLeft} left · {naira(unit)} each</span></div>
      <div className="mt-3 flex items-center gap-3"><button className="btn-ghost w-11 px-0 text-lg" onClick={() => setUnits((u) => Math.max(1, u - 1))} aria-label="Fewer units">−</button>
        <input className="input text-center text-lg font-bold" inputMode="numeric" value={units} onChange={(e) => setUnits(Math.max(1, Math.min(seatsLeft, Number(e.target.value.replace(/\D/g, "")) || 1)))} />
        <button className="btn-ghost w-11 px-0 text-lg" onClick={() => setUnits((u) => Math.min(seatsLeft, u + 1))} aria-label="More units">+</button></div>
      <div className="mt-3 grid grid-cols-2 gap-2"><div className="k-tile wash-mint"><div className="text-[11px] opacity-75">Est. profit</div><b className="text-[15px]">{naira(profitPerUnit * units)}</b></div><div className="k-tile wash-blue"><div className="text-[11px] opacity-75">Your share</div><b className="text-[15px]">{units} unit{units > 1 ? "s" : ""}</b></div></div></div>}
    <div className="card p-4 text-sm space-y-2">
      {row(invest ? "Units" : "Property price", naira(amt))}
      {invest && row(<>Insurance<Tip text={`Covers the raise pool via ${insurer}.`} /></>, naira(f.insurance))}
      {row(<>Due diligence<Tip text="Title, survey and site verification before funds move." /></>, naira(f.diligence))}
      {row("Total", naira(total), true)}</div>
    <div className="card p-4 space-y-2"><span className="label">Pay with</span>
      {([["monnify", "Monnify", "Card · transfer · USSD"], ["wallet", "Kraud wallet", `Balance ${naira(wallet)}`]] as const).map(([m, t, sub]) => <button key={m} onClick={() => setMethod(m)} disabled={m === "wallet" && wallet < total} className={`w-full flex justify-between items-center rounded-xl border px-4 h-14 text-sm transition duration-200 disabled:opacity-50 ${method === m ? "border-teal bg-teal-50" : "border-silver-200"}`}><span className="text-left leading-tight"><b className="text-navy">{t}</b><span className="block text-[11px] text-silver">{sub}</span></span><span className={`w-4 h-4 rounded-full border-2 ${method === m ? "border-teal bg-teal" : "border-silver-200"}`} /></button>)}</div>
    <Err e={err} /><button className="btn-primary w-full h-12" disabled={busy} onClick={pay}><Icon n="lock" className="w-4 h-4" />{busy ? "Processing…" : invest ? `Invest ${naira(total)}` : `Buy for ${naira(total)}`}</button>
    {method === "monnify" && <p className="text-[11px] text-center text-silver">{payMode === "live" ? "Monnify live" : payMode === "sandbox" ? "Monnify sandbox" : payMode === "simulator" ? "Local simulator (no Monnify keys)" : "Monnify not configured"}</p>}
  </div>);
}
export function WalletTopUp() {
  const [amt, setAmt] = useState(""); return (<div className="flex gap-2"><input className="input" inputMode="numeric" placeholder="Amount (₦)" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} /><PayRedirect action="wallet-topup" body={{ amount: Number(amt) }} label="Top up" className="btn-teal shrink-0" /></div>);
}
export function VaultCreate({ r3, r12 }: { r3: number; r12: number }) {
  const r = useRouter(); const [months, setMonths] = useState(12); const [title, setTitle] = useState(""); const [busy, setBusy] = useState(false); const [e, setE] = useState("");
  return (<div className="space-y-3"><div className="grid grid-cols-2 gap-2">{([[3, r3, "wash-gold"], [12, r12, "wash-mint"]] as const).map(([m, rate, w]) => <button key={m} onClick={() => setMonths(m)} className={`rounded-2xl p-3 text-left ring-2 transition duration-200 ${w} ${months === m ? "ring-teal" : "ring-transparent"}`}><b className="block text-lg">{rate}% <span className="text-xs font-semibold">p.a.</span></b><span className="text-xs">Lock {m === 3 ? "up to 3 months" : "up to 12 months"}</span></button>)}</div>
    <input className="input" placeholder="Name it (e.g. Land fund)" value={title} onChange={(x) => setTitle(x.target.value)} /><Err e={e} />
    <button className="btn-primary w-full" disabled={busy} onClick={async () => { setBusy(true); setE(""); try { await post("vault-create", { months, title }); setTitle(""); r.refresh(); } catch (x: any) { setE(x.message); } setBusy(false); }}>Open vault</button></div>);
}
export function VaultTopUp({ id, wallet }: { id: string; wallet: number }) {
  const r = useRouter(); const [amt, setAmt] = useState(""); const [e, setE] = useState(""); const [busy, setBusy] = useState(false);
  const go = async (method: string) => { setBusy(true); setE(""); try { const d = await post("vault-topup", { id, amount: Number(amt), method }); if (method === "wallet") { setAmt(""); r.refresh(); setBusy(false); } else window.location.href = d.checkoutUrl; } catch (x: any) { setE(x.message); setBusy(false); } };
  return (<div className="space-y-1.5"><div className="flex gap-2"><input className="input h-10" inputMode="numeric" placeholder="₦" value={amt} onChange={(x) => setAmt(x.target.value.replace(/\D/g, ""))} /><button className="btn-teal h-10 shrink-0" disabled={busy} onClick={() => go("monnify")}>Add</button>{wallet >= Number(amt || 0) && wallet > 0 && <button className="btn-ghost h-10 shrink-0" disabled={busy} onClick={() => go("wallet")}>From wallet</button>}</div><Err e={e} /></div>);
}
export function AvatarUpload({ src, name, required }: { src: string | null; name: string; required?: boolean }) {
  const r = useRouter(); const [busy, setBusy] = useState(false); const [e, setE] = useState(""); const [img, setImg] = useState(src);
  const up = async (f: File) => { setBusy(true); setE(""); const fd = new FormData(); fd.append("file", f); try { const res = await fetch("/api/upload?kind=avatar", { method: "POST", body: fd }); const d = await res.json(); if (!res.ok) throw new Error(d.error || "Upload failed"); setImg(d.url); r.refresh(); } catch (x: any) { setE(x.message); } setBusy(false); };
  return (<div className="flex items-center gap-4"><label className="relative cursor-pointer group">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {img ? <img src={img} alt={name} className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-card" /> : <img src="/avatars/default.webp" alt="" className="w-20 h-20 rounded-full ring-4 ring-white shadow-card" />}
    <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teal text-white grid place-items-center ring-2 ring-white transition duration-200 group-hover:scale-110"><Icon n="camera" className="w-4 h-4" /></span>
    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={(x) => x.target.files?.[0] && up(x.target.files[0])} /></label>
    <div className="text-sm"><b className="text-navy block">{busy ? "Uploading…" : img ? "Profile photo" : "Add a photo or logo"}</b>{required && !img && <span className="chip wash-coral mt-1">Required to publish listings</span>}<Err e={e} /></div></div>);
}
export function CopyCode({ code, link }: { code: string; link: string }) {
  const [ok, setOk] = useState(""); const copy = async (t: string, w: string) => { try { await navigator.clipboard.writeText(t); setOk(w); setTimeout(() => setOk(""), 1500); } catch {} };
  return (<div className="flex flex-wrap gap-2 items-center"><span className="font-mono font-bold text-lg tracking-widest text-navy bg-white rounded-xl px-3 h-10 grid place-items-center ring-1 ring-navy/10">{code}</span>
    <button className="btn-ghost h-10" onClick={() => copy(code, "Code copied")}>Copy code</button><button className="btn-teal h-10" onClick={async () => { if (navigator.share) { try { await navigator.share({ title: "Join me on Kraud", text: `Own Together. Grow Together. Use my code ${code}`, url: link }); } catch {} } else copy(link, "Link copied"); }}>Share link</button>{ok && <span className="text-xs text-teal k-pop">{ok}</span>}</div>);
}
export function PayRedirect({ action, body, label, className = "btn-primary" }: { action: string; body: unknown; label: React.ReactNode; className?: string }) {
  const [busy, setBusy] = useState(false); const [e, setE] = useState("");
  return (<span className="inline-flex flex-col"><button disabled={busy} className={className} onClick={async () => { setBusy(true); setE(""); try { const d = await post(action, body); window.location.href = d.checkoutUrl; } catch (x: any) { setE(x.message); setBusy(false); } }}>{busy ? "Opening Monnify…" : label}</button>{e && <span className="text-xs text-red-700 mt-1">{e}</span>}</span>);
}
export function SimulatePay({ reference, amount, title }: { reference: string; amount: number; title: string }) {
  const r = useRouter(); const [method, setMethod] = useState("Bank Transfer"); const [busy, setBusy] = useState(false); const [e, setE] = useState("");
  return (<div className="bg-white w-full sm:max-w-md mx-auto rounded-3xl p-5 space-y-4 shadow-lift">
    <div className="flex items-center justify-between"><div className="font-extrabold text-[#0B1B33]">monnify<span className="text-[#F0AA22]">.</span></div><span className="chip bg-silver-200 text-navy">LOCAL SIMULATOR</span></div>
    <div className="rounded-xl bg-paper p-3 text-sm"><div className="text-silver text-xs">Kraud · {title}</div><div className="text-xl font-bold text-navy">{naira(amount)}</div><div className="text-[11px] text-silver font-mono">{reference}</div></div>
    <div className="grid grid-cols-3 gap-2">{["Bank Transfer", "Card", "USSD"].map((m) => <button key={m} onClick={() => setMethod(m)} className={`rounded-xl border h-11 text-xs font-semibold ${method === m ? "border-navy bg-navy-50 text-navy" : "border-silver-200"}`}>{m}</button>)}</div>
    <p className="text-xs text-silver">Shown only when MONNIFY_* keys are empty and NODE_ENV is not production. Add sandbox keys to use the real Monnify checkout.</p><Err e={e} />
    <button className="btn-teal w-full h-12" disabled={busy} onClick={async () => { setBusy(true); try { const d = await post("sim-pay", { ref: reference, method }); r.push("/receipt/" + d.ref); } catch (x: any) { setE(x.message); setBusy(false); } }}>{busy ? "Confirming…" : "Approve test payment"}</button></div>);
}
export function ChatBox({ id, me, msgs, placeholder = "Message…", prefill = "" }: { id: string; me: string; msgs: { from: string; text: string; at: number }[]; placeholder?: string; prefill?: string }) {
  const r = useRouter(); const [t, setT] = useState(prefill); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView(); post("chat-read", { id }).catch(() => {}); }, [msgs.length, id]);
  useEffect(() => { const i = setInterval(() => { if (document.visibilityState === "visible") r.refresh(); }, 5000); return () => clearInterval(i); }, [r]);
  return (<div className="flex flex-col h-[calc(100dvh-140px)] lg:h-[calc(100vh-90px)]">
    <div className="flex-1 overflow-y-auto px-4 space-y-2 py-3">{msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] whitespace-pre-wrap break-words ${m.from === me ? "ml-auto bg-[#E8EDF5] text-navy rounded-br-sm" : "bg-[#E6F2F1] text-[#0B1B33] rounded-bl-sm"}`}>{m.text}<div className={`text-[10px] mt-0.5 ${"text-silver"}`}>{new Date(m.at).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" })}</div></div>)}<div ref={end} /></div>
    <form className="flex gap-2 p-3 bg-white border-t border-silver-200" style={{ paddingBottom: "max(env(safe-area-inset-bottom),12px)" }} onSubmit={async (e) => { e.preventDefault(); if (!t.trim()) return; const x = t; setT(""); await post("chat-send", { id, text: x }).catch((er) => alert(er.message)); r.refresh(); }}>
      <input value={t} onChange={(e) => setT(e.target.value)} className="input" placeholder={placeholder} maxLength={1000} /><button className="btn-primary w-12 px-0" aria-label="Send"><Icon n="send" /></button></form></div>);
}
export function KycForm() {
  const r = useRouter(); const [st, setSt] = useState(""); const f = useForm("kyc", (d) => { setSt(d.status); r.refresh(); });
  if (st === "PENDING_REVIEW") return <p className="chip bg-silver-200 text-navy">Submitted — under review</p>;
  return (<form onSubmit={f.onSubmit} className="space-y-3">
    <label className="block"><span className="label inline-flex items-center gap-1.5">Full Name<Tip text="Name as it appears on your NIN and BVN." /></span><input name="legalName" className="input mt-1.5" placeholder="Ada Chioma Okafor" required /></label>
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Date of birth</span><input name="dob" type="date" className="input mt-1.5" required /></label><label className="block"><span className="label">Phone</span><input name="phone" inputMode="tel" className="input mt-1.5" placeholder="0803…" required /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">NIN</span><input name="nin" inputMode="numeric" maxLength={11} pattern="\d{11}" className="input mt-1.5" placeholder="11 digits" required /></label>
    <label className="block"><span className="label">BVN</span><input name="bvn" inputMode="numeric" maxLength={11} pattern="\d{11}" className="input mt-1.5" placeholder="11 digits" required /></label></div>
    <Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy}>{f.busy ? "Checking…" : "Verify Identity"}</button><p className="flex justify-center"><Tip text="Encrypted at rest; only the last 4 digits are ever shown. Asked once — never again." /></p></form>);
}
export function TopUp({ id }: { id: string }) {
  return (<div className="flex gap-2">{[50000, 250000, 1000000].map((a) => <PayRedirect key={a} action="topup" body={{ id, amount: a }} className="btn-ghost w-full px-2 text-xs" label={"+" + naira(a)} />)}</div>);
}
export const BANKS: [string, string][] = [["044", "Access Bank"], ["023", "Citibank"], ["050", "Ecobank"], ["070", "Fidelity Bank"], ["011", "First Bank"], ["214", "FCMB"], ["058", "GTBank"], ["030", "Heritage"], ["082", "Keystone"], ["50515", "Moniepoint MFB"], ["999992", "OPay"], ["999991", "PalmPay"], ["076", "Polaris"], ["221", "Stanbic IBTC"], ["232", "Sterling"], ["032", "Union Bank"], ["033", "UBA"], ["035", "Wema Bank"], ["057", "Zenith Bank"]];
export function Withdraw({ goalId = "", amount, source }: { goalId?: string; amount: number; source?: "wallet" }) {
  const r = useRouter(); const [open, setOpen] = useState(false); const [dev, setDev] = useState(""); const [exp, setExp] = useState(0); const [left, setLeft] = useState(0); const [e, setE] = useState("");
  const f = useForm("withdraw", () => { setOpen(false); r.refresh(); });
  useEffect(() => { if (!exp) return; const i = setInterval(() => setLeft(Math.max(0, exp - Date.now())), 1000); return () => clearInterval(i); }, [exp]);
  if (!amount) return null;
  if (!open) return <><button className="btn-ghost w-full" onClick={async () => { setE(""); try { const d = await post("2fa-send", {}); setOpen(true); setExp(d.exp); if (d.devPhrase) setDev(d.devPhrase); } catch (x: any) { setE(x.message); } }}><Icon n="lock" className="w-4 h-4" />Withdraw {naira(amount)} (2FA)</button><Err e={e} /></>;
  return (<form onSubmit={f.onSubmit} className="space-y-3 rounded-xl bg-paper p-3"><input type="hidden" name="goalId" value={goalId} />{source && <><input type="hidden" name="source" value={source} /><input type="hidden" name="amount" value={amount} /></>}
    <p className="text-sm">We emailed a Nigerian 2-word phrase. Expires in <b className="text-navy font-mono">{Math.floor(left / 60000)}:{String(Math.floor(left / 1000) % 60).padStart(2, "0")}</b></p>
    {dev && <p className="chip bg-teal-50 text-teal">Dev (SMTP off): {dev}</p>}
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Bank</span><select name="bankCode" className="input mt-1.5" required>{BANKS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label><label className="block"><span className="label">Account no.</span><input name="accountNumber" inputMode="numeric" maxLength={10} className="input mt-1.5" placeholder="10 digits" required /></label></div>
    <PasswordInput name="phrase" label="2FA phrase" placeholder="e.g. owambe kano" help={false} /><Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy}>Confirm withdrawal</button></form>);
}
function F({ l, n, label, type = "text", ph, opt, tip, dis, onChange }: { l?: any; n: string; label: string; type?: string; ph?: string; opt?: boolean; tip?: string; dis?: boolean; onChange?: (v: string) => void }) { return <label className="block"><span className="label flex items-center gap-1">{label}{tip && <Tip text={tip} />}</span><input name={n} type={type} step={type === "number" ? "any" : undefined} defaultValue={l?.[n] ?? undefined} placeholder={ph} className="input mt-1.5 disabled:opacity-60" required={!opt} readOnly={dis} onChange={onChange ? (e) => onChange(e.target.value) : undefined} /></label>; }
export function ListingForm({ l, states, hasPhoto }: { l?: any; states: string[]; hasPhoto: boolean }) {
  const [cm, setCm] = useState<string>(l?.commerceMode || "BOTH"); const [tn, setTn] = useState(Number(l?.totalNeeded || 0)); const [sn, setSn] = useState(Number(l?.seatsNeeded || 0)); const locked = (l?.seatsTaken || 0) > 0;
  const r = useRouter(); const [imgs, setImgs] = useState<string[]>(() => { const a: string[] = []; for (const f of [l?.img, ...(l?.files || [])]) if (f && /^\/media\/listings\//.test(f) && !a.includes(f)) a.push(f); return a; }); const [up, setUp] = useState(""); const f = useForm("listing-save", () => { r.push("/seller"); r.refresh(); });
  const upload = async (list: FileList) => { const fs = Array.from(list).slice(0, 12 - imgs.length); for (let k = 0; k < fs.length; k++) { setUp(`Uploading ${k + 1}/${fs.length}…`); const fd = new FormData(); fd.append("file", fs[k]); const res = await fetch("/api/upload", { method: "POST", body: fd }); const d = await res.json(); if (!res.ok) return setUp(d.error); setImgs((a) => [...a, d.url]); } setUp(""); };
  const move = (k: number, d: number) => setImgs((a) => { const b = [...a]; const t = k + d; if (t < 0 || t >= b.length) return a; [b[k], b[t]] = [b[t], b[k]]; return b; });
  return (<form onSubmit={f.onSubmit} className="space-y-3">{l && <input type="hidden" name="id" value={l.id} />}<input type="hidden" name="img" value={imgs[0] || ""} /><input type="hidden" name="imgs" value={JSON.stringify(imgs)} />
    <div><span className="label">Photos ({imgs.length}/12) — first is the cover</span><div className="mt-1.5 grid grid-cols-3 sm:grid-cols-4 gap-2">
      {imgs.map((src, k) => <div key={src} className="relative aspect-square rounded-xl overflow-hidden group"><img src={src} alt="" className="w-full h-full object-cover" />{k === 0 && <span className="absolute top-1 left-1 chip bg-navy text-white text-[10px]">Cover</span>}
        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 text-white text-xs"><button type="button" onClick={() => move(k, -1)} className="px-2 py-1" aria-label="Move left">‹</button><button type="button" onClick={() => setImgs((a) => a.filter((x) => x !== src))} className="px-2 py-1" aria-label="Remove">✕</button><button type="button" onClick={() => move(k, 1)} className="px-2 py-1" aria-label="Move right">›</button></div></div>)}
      {imgs.length < 12 && <label className="aspect-square rounded-xl border border-dashed border-silver grid place-items-center text-center text-xs text-silver cursor-pointer hover:border-teal hover:text-teal p-2">+ Add photos<br />(JPG/PNG/WEBP, 8 MB)<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { e.target.files?.length && upload(e.target.files); e.target.value = ""; }} /></label>}
    </div>{up && <p className="text-xs text-silver mt-1">{up}</p>}</div>
    <F l={l} n="title" label="Title" ph="4-Bed Detached Duplex" />
    <div className="grid grid-cols-2 gap-3"><F l={l} n="city" label="City / town" ph="Umuahia" /><label className="block"><span className="label">State</span><select name="state" defaultValue={l?.state || "Lagos"} className="input mt-1.5">{states.map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <F l={l} n="estate" label="Estate / area" ph="Kraud Gardens, Ubakala Rd" />
    <div className="grid grid-cols-2 gap-3"><F l={l} n="price" label="Price (₦)" type="number" /><label className="block"><span className="label">Stage</span><select name="status" defaultValue={l?.status || "Completed"} className="input mt-1.5">{[["Completed", "Completed"], ["Carcass", "Carcass (Uncompleted)"], ["Off-plan", "Off-plan"]].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label></div>
    <div className="grid grid-cols-4 gap-3"><F l={l} n="beds" label="Beds" type="number" /><F l={l} n="baths" label="Baths" type="number" /><F l={l} n="sqm" label="m²" type="number" /><F l={l} n="type" label="Type" ph="Duplex" /></div>
    <div className="rounded-2xl k-hero ring-1 ring-navy/5 p-3 space-y-3"><div className="flex items-center justify-between"><b className="text-navy text-sm">How buyers can take part</b>{locked && <span className="chip wash-gold">Terms locked — co-owners joined</span>}</div><input type="hidden" name="commerceMode" value={cm} />
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/70 p-1 text-[13px] font-semibold">{([["INVEST", "Co-own"], ["BUY", "Buy whole"], ["BOTH", "Both"]] as const).map(([v, t]) => <button type="button" key={v} disabled={locked} onClick={() => setCm(v)} className={`h-9 rounded-lg transition duration-200 ${cm === v ? "tab-on" : "text-silver"}`}>{t}</button>)}</div>
      {cm !== "BUY" && <><label className="block"><span className="label">Timeframe</span><select name="horizon" defaultValue={l?.horizon || "SHORT_6M"} disabled={locked} className="input mt-1.5"><option value="SHORT_6M">Short · 6 months</option><option value="LONG_12_18M">Long · 12–18 months</option></select>{locked && <input type="hidden" name="horizon" value={l?.horizon} />}</label>
        <div className="grid grid-cols-2 gap-3"><F l={l} n="totalNeeded" label="Total to raise (₦)" type="number" dis={locked} onChange={(v) => setTn(Number(v))} tip="Purchase + completion + maintenance the co-owners fund." /><F l={l} n="seatsNeeded" label="Units" type="number" dis={locked} onChange={(v) => setSn(Number(v))} tip="Number of co-ownership units on offer." /></div>
        <input type="hidden" name="unitPrice" value={sn > 0 ? Math.ceil(tn / sn) : 0} />{sn > 0 && tn > 0 && <p className="text-xs text-teal">{naira(Math.ceil(tn / sn))} per unit</p>}
        <div className="grid grid-cols-2 gap-3"><F l={l} n="maintenanceCost" label="Maintenance (₦)" type="number" opt dis={locked} /><F l={l} n="completionCost" label="Completion (₦)" type="number" opt dis={locked} /></div>
        <div className="grid grid-cols-2 gap-3"><F l={l} n="estimatedProfit" label="Est. total profit (₦)" type="number" dis={locked} tip="Projected profit shared across all units at exit." /><F l={l} n="minProfitMargin" label="Min margin (%)" type="number" opt dis={locked} /></div>
        <div className="grid grid-cols-2 gap-3"><F l={l} n="insuranceFee" label="Insurance / unit (₦)" type="number" opt ph="Admin default" tip="Leave blank to use Kraud's default." /><F l={l} n="diligenceFee" label="Due diligence (₦)" type="number" opt ph="Admin default" /></div></>}</div>
    <label className="block"><span className="label">Description</span><textarea name="desc" defaultValue={l?.desc} rows={4} className="input mt-1.5 h-auto py-2" required /></label>
    {!hasPhoto && <div className="rounded-xl wash-coral p-3 text-sm flex items-center gap-2"><Icon n="camera" className="w-4 h-4" />Add a profile photo or logo on your <Link href="/profile" className="underline font-semibold">Profile</Link> before publishing.</div>}<Err e={f.error} /><button className="btn-primary w-full" disabled={f.busy || !hasPhoto}>{l ? "Save & resubmit for review" : "Submit for review"}</button><p className="text-xs text-silver">Listings go live after Kraud moderation (title documents check).</p></form>);
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
export function SettingsForm({ values, labels }: { values: Record<string, string | number>; labels: Record<string, string> }) {
  const r = useRouter(); const [v, setV] = useState(values); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(""); const [e, setE] = useState("");
  return (<form className="space-y-3" onSubmit={async (x) => { x.preventDefault(); setBusy(true); setE(""); setMsg(""); try { await post("settings-save", v); setMsg("Saved"); r.refresh(); } catch (y: any) { setE(y.message); } setBusy(false); }}>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{Object.keys(values).map((k) => <label key={k} className="block"><span className="label">{labels[k] || k}</span><input className="input mt-1.5" value={String(v[k])} inputMode={typeof values[k] === "number" ? "decimal" : undefined} onChange={(y) => setV((o) => ({ ...o, [k]: typeof values[k] === "number" ? y.target.value.replace(/[^\d.]/g, "") : y.target.value }))} /></label>)}</div>
    <div className="flex items-center gap-3"><button className="btn-teal" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>{msg && <span className="text-xs text-teal k-pop">{msg}</span>}<Err e={e} /></div></form>);
}
