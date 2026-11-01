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
  const f = useForm("signup", (d) => { if (d.devLink) setDev(d.devLink); else { r.push("/explore"); r.refresh(); } });
  if (dev) return (<div className="space-y-4 text-center"><div className="mx-auto w-14 h-14 rounded-full bg-teal-50 text-teal grid place-items-center"><Icon n="check" className="w-7 h-7" /></div><h2 className="text-lg font-bold text-navy">Check your email</h2><p className="text-sm text-silver">We sent a Nigerian-word verification phrase. SMTP is off in this demo, so use the dev link:</p><a href={dev} className="btn-teal w-full">Dev: open verify link</a><Link href="/explore" className="btn-ghost w-full">Skip for now</Link></div>);
  return (<form onSubmit={f.onSubmit} className="space-y-4">
    <label className="block"><span className="label">Full name</span><input name="name" className="input mt-1.5" placeholder="Ada Okafor" required /></label>
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
export function Checkout({ id, price, title, blocked }: { id: string; price: number; title: string; blocked?: React.ReactNode }) {
  const r = useRouter(); const [mode, setMode] = useState<"full" | "deposit">("deposit"); const [method, setMethod] = useState("Bank Transfer"); const [stage, setStage] = useState<"pick" | "monnify" | "proc">("pick"); const [err, setErr] = useState("");
  const amt = mode === "deposit" ? Math.round(price * 0.3) : price; const fee = Math.min(Math.round(amt * 0.015), 2_000_000);
  const pay = async () => { setStage("proc"); setErr(""); try { const d = await post("pay", { listingId: id, mode, method: "Monnify " + method }); setTimeout(() => r.push("/receipt/" + d.ref), 1200); } catch (e: any) { setErr(e.message); setStage("pick"); } };
  if (blocked) return <>{blocked}</>;
  return (<div className="space-y-4">
    <div className="card p-4 space-y-2"><span className="label">Payment</span>
      {(["deposit", "full"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`w-full flex justify-between items-center rounded-xl border px-4 h-14 text-sm ${mode === m ? "border-navy bg-navy-50" : "border-silver-200"}`}><span className="font-medium">{m === "deposit" ? "30% deposit (escrow)" : "Pay in full (escrow)"}</span><b className="text-navy">{naira(m === "deposit" ? price * 0.3 : price)}</b></button>)}</div>
    <div className="card p-4 text-sm space-y-1.5"><div className="flex justify-between"><span className="text-silver">Amount</span><span>{naira(amt)}</span></div><div className="flex justify-between"><span className="text-silver">Escrow fee (1.5%, capped)</span><span>{naira(fee)}</span></div><div className="flex justify-between font-bold text-navy pt-2 border-t border-silver-200"><span>Total</span><span>{naira(amt + fee)}</span></div></div>
    <Err e={err} /><button className="btn-primary w-full h-12" onClick={() => setStage("monnify")}><Icon n="lock" className="w-4 h-4" />Continue to Monnify</button>
    {stage !== "pick" && (<div className="fixed inset-0 z-50 bg-black/50 grid items-end sm:place-items-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4" style={{ paddingBottom: "max(env(safe-area-inset-bottom),20px)" }}>
        <div className="flex items-center justify-between"><div className="font-extrabold text-[#0B1B33]">monnify<span className="text-[#F0AA22]">.</span></div><span className="text-xs text-silver">Secured checkout · TEST MODE</span></div>
        <div className="rounded-xl bg-paper p-3 text-sm"><div className="text-silver text-xs">Kraud Escrow · {title}</div><div className="text-2xl font-bold text-navy">{naira(amt + fee)}</div></div>
        {stage === "proc" ? <div className="py-8 text-center text-sm text-silver"><div className="mx-auto mb-3 w-10 h-10 rounded-full border-4 border-silver-200 border-t-teal animate-spin" />Confirming payment with Monnify…</div> : <>
        <div className="grid grid-cols-3 gap-2">{["Bank Transfer", "Card", "USSD"].map((m) => <button key={m} onClick={() => setMethod(m)} className={`rounded-xl border h-11 text-xs font-semibold ${method === m ? "border-navy bg-navy-50 text-navy" : "border-silver-200"}`}>{m}</button>)}</div>
        {method === "Bank Transfer" && <div className="rounded-xl border border-dashed border-silver p-3 text-sm"><div className="text-xs text-silver">Transfer to (reserved account)</div><div className="font-mono text-lg text-navy">5000 4128 93</div><div className="text-xs">Wema Bank · KRAUD ESCROW / MONNIFY</div></div>}
        <button className="btn-teal w-full h-12" onClick={pay}>I've paid — simulate success</button><button className="w-full text-sm text-silver" onClick={() => setStage("pick")}>Cancel</button></>}
      </div></div>)}
  </div>);
}
export function ChatBox({ id, me, msgs }: { id: string; me: string; msgs: { from: string; text: string; at: number }[] }) {
  const r = useRouter(); const [t, setT] = useState(""); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs.length]);
  return (<div className="flex flex-col h-[calc(100dvh-140px)] lg:h-[calc(100vh-90px)]">
    <div className="flex-1 overflow-y-auto px-4 space-y-2 py-3">{msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] ${m.from === me ? "ml-auto bg-navy text-white rounded-br-sm" : "bg-white shadow-card rounded-bl-sm"}`}>{m.text}<div className={`text-[10px] mt-0.5 ${m.from === me ? "text-white/60" : "text-silver"}`}>{new Date(m.at).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" })}</div></div>)}<div ref={end} /></div>
    <form className="flex gap-2 p-3 bg-white border-t border-silver-200" onSubmit={async (e) => { e.preventDefault(); if (!t.trim()) return; const x = t; setT(""); await post("chat-send", { id, text: x }); r.refresh(); }}>
      <input value={t} onChange={(e) => setT(e.target.value)} className="input" placeholder="Message seller…" /><button className="btn-primary w-12 px-0" aria-label="Send"><Icon n="send" /></button></form></div>);
}
export function KycForm() {
  const r = useRouter(); const f = useForm("kyc", () => r.refresh());
  return (<form onSubmit={f.onSubmit} className="space-y-3"><label className="block"><span className="label">NIN</span><input name="nin" inputMode="numeric" maxLength={11} className="input mt-1.5" placeholder="11 digits" required /></label>
    <label className="block"><span className="label">BVN</span><input name="bvn" inputMode="numeric" maxLength={11} className="input mt-1.5" placeholder="11 digits" required /></label><Err e={f.error} /><button className="btn-primary w-full">Verify identity (one-off)</button><p className="text-xs text-silver">Demo: any 11 digits pass. Production calls a licensed NIN/BVN provider; only masked values are stored.</p></form>);
}
export function TopUp({ id }: { id: string }) {
  const r = useRouter(); const [busy, setBusy] = useState(false);
  return (<div className="flex gap-2">{[50000, 250000, 1000000].map((a) => <button key={a} disabled={busy} className="btn-ghost flex-1 px-2 text-xs" onClick={async () => { setBusy(true); await post("topup", { id, amount: a }); setBusy(false); r.refresh(); }}>+{naira(a)}</button>)}</div>);
}
export function Withdraw({ goalId, amount }: { goalId: string; amount: number }) {
  const r = useRouter(); const [open, setOpen] = useState(false); const [dev, setDev] = useState(""); const [exp, setExp] = useState(0); const [left, setLeft] = useState(0);
  const f = useForm("withdraw", () => { setOpen(false); r.refresh(); });
  useEffect(() => { if (!exp) return; const i = setInterval(() => setLeft(Math.max(0, exp - Date.now())), 1000); return () => clearInterval(i); }, [exp]);
  if (!amount) return null;
  if (!open) return <button className="btn-ghost w-full" onClick={async () => { setOpen(true); const d = await post("2fa-send", {}); setExp(d.exp); if (d.devPhrase) setDev(d.devPhrase); }}><Icon n="lock" className="w-4 h-4" />Withdraw {naira(amount)} (2FA)</button>;
  return (<form onSubmit={f.onSubmit} className="space-y-3 rounded-xl bg-paper p-3"><input type="hidden" name="goalId" value={goalId} />
    <p className="text-sm">We emailed a Nigerian 2-word phrase. Expires in <b className="text-navy font-mono">{Math.floor(left / 60000)}:{String(Math.floor(left / 1000) % 60).padStart(2, "0")}</b></p>
    {dev && <p className="chip bg-teal-50 text-teal">Dev (SMTP off): {dev}</p>}
    <PasswordInput name="phrase" label="2FA phrase" placeholder="e.g. owambe kano" help={false} /><Err e={f.error} /><button className="btn-primary w-full">Confirm withdrawal</button></form>);
}
