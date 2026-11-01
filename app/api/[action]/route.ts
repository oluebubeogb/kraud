import { NextRequest, NextResponse } from "next/server";
import { load, tx, uid, type User } from "@/lib/db";
import { checkPassphrase } from "@/lib/words";
import { checkPw, clearSession, currentUser, findLogin, hashPw, isAdmin, issueToken, setSession, useToken } from "@/lib/auth";
import { sendMail, smtpOn } from "@/lib/mail";
import { seedAdd, seedRemove } from "@/lib/seed";
import { naira } from "@/lib/format";
const j = (d: unknown, s = 200) => NextResponse.json(d, { status: s });
const err = (e: string, s = 400) => j({ error: e }, s);
const base = () => process.env.APP_URL || "http://localhost:3000";
const dev = (o: Record<string, unknown>) => (smtpOn() ? {} : o);
function remind(userId: string, title: string, body: string) { tx((db) => { db.reminders.unshift({ id: uid("r_"), userId, title, body, at: Date.now() }); }); }

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const b = await req.json().catch(() => ({} as any));
  const me = await currentUser();
  const need = () => { if (!me) throw new Error("Please sign in"); return me; };
  try {
    switch (action) {
      case "signup": {
        const username = String(b.username || "").trim().toLowerCase(), email = String(b.email || "").trim().toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(username)) return err("Username: 3–20 letters, numbers or _");
        if (!/^\S+@\S+\.\S+$/.test(email)) return err("Enter a valid email");
        const pe = checkPassphrase(String(b.password || "")); if (pe) return err(pe);
        if (findLogin(username) || findLogin(email)) return err("Username or email already in use");
        const { hash, salt } = hashPw(b.password);
        const u: User = { id: uid("u_"), username, email, name: String(b.name || username), hash, salt, verified: false, created: Date.now() };
        tx((db) => { db.users.push(u); });
        const t = issueToken(u.id, "verify");
        const link = `${base()}/verify?u=${u.id}&p=${encodeURIComponent(t.phrase)}`;
        await sendMail(email, "Verify your Kraud account", `Welcome to Kraud.\nYour verification phrase: ${t.phrase}\nOr open: ${link}`);
        await setSession(u.id); remind(u.id, "Verify your email", "Confirm your email to unlock buying and withdrawals.");
        return j({ ok: true, ...dev({ devLink: link }) });
      }
      case "login": {
        const u = findLogin(String(b.id || "")); if (!u || !checkPw(u, String(b.password || ""))) return err("Wrong username/email or passphrase", 401);
        await setSession(u.id); return j({ ok: true });
      }
      case "logout": await clearSession(); return j({ ok: true });
      case "resend-verify": { const u = need(); const t = issueToken(u.id, "verify"); const link = `${base()}/verify?u=${u.id}&p=${encodeURIComponent(t.phrase)}`; await sendMail(u.email, "Verify your Kraud account", `Phrase: ${t.phrase}\n${link}`); return j({ ok: true, ...dev({ devLink: link }) }); }
      case "verify": { const r = useToken(String(b.u), "verify", String(b.p || "")); if (r !== "ok") return err(r === "expired" ? "Link expired — resend" : "Invalid verification phrase"); tx((db) => { const u = db.users.find((x) => x.id === b.u); if (u) u.verified = true; }); return j({ ok: true }); }
      case "forgot": {
        const u = findLogin(String(b.id || "")); if (!u) return j({ ok: true }); // don't leak existence
        const t = issueToken(u.id, "reset"); await sendMail(u.email, "Kraud passphrase reset", `Your reset phrase (valid 15 minutes): ${t.phrase}`);
        return j({ ok: true, ...dev({ devPhrase: t.phrase }) });
      }
      case "reset": {
        const u = findLogin(String(b.id || "")); if (!u) return err("Invalid reset phrase");
        const pe = checkPassphrase(String(b.password || "")); if (pe) return err(pe);
        const r = useToken(u.id, "reset", String(b.phrase || "")); if (r !== "ok") return err(r === "expired" ? "Reset phrase expired (15 min). Request a new one." : "Invalid reset phrase");
        const { hash, salt } = hashPw(b.password); tx((db) => { const x = db.users.find((y) => y.id === u.id)!; x.hash = hash; x.salt = salt; }); return j({ ok: true });
      }
      case "kyc": { const u = need(); if (!/^\d{11}$/.test(b.nin) || !/^\d{11}$/.test(b.bvn)) return err("NIN and BVN must be 11 digits"); tx((db) => { db.users.find((x) => x.id === u.id)!.kyc = { nin: "*******" + b.nin.slice(-4), bvn: "*******" + b.bvn.slice(-4), at: Date.now() }; }); remind(u.id, "KYC verified", "One-off identity check complete. You can buy and withdraw."); return j({ ok: true }); }
      case "pay": {
        const u = need(); if (!u.verified) return err("Verify your email first"); if (!u.kyc) return err("Complete one-off KYC first");
        const l = load().listings.find((x) => x.id === b.listingId); if (!l) return err("Listing not found");
        const amount = b.mode === "deposit" ? Math.round(l.price * 0.3) : l.price; const fee = Math.min(Math.round(amount * 0.015), 2_000_000);
        const ref = "KRD-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + uid().slice(0, 6).toUpperCase();
        tx((db) => { db.payments.unshift({ ref, userId: u.id, listingId: l.id, title: l.title, amount, fee, method: String(b.method || "Monnify Transfer"), at: Date.now(), status: "Paid in escrow" }); });
        remind(u.id, "Payment received — " + ref, `${naira(amount)} held in escrow for ${l.title}. Inspection reminder set for 7 days.`);
        await sendMail(u.email, "Kraud receipt " + ref, `Paid ${naira(amount)} for ${l.title}. Ref ${ref}`);
        return j({ ok: true, ref });
      }
      case "goal": { const u = need(); const l = load().listings.find((x) => x.id === b.listingId); if (!l) return err("Listing not found"); const id = uid("g_"); tx((db) => { db.goals.unshift({ id, userId: u.id, listingId: l.id, title: l.title, target: l.status === "Completed" ? l.price : Math.round(l.price), saved: 0, created: Date.now() }); }); remind(u.id, "Savings goal created", `Saving toward ${l.title}. We'll nudge you monthly.`); return j({ ok: true, id }); }
      case "topup": { const u = need(); const amt = Math.max(1000, Number(b.amount) || 0); tx((db) => { const g = db.goals.find((x) => x.id === b.id && x.userId === u.id); if (g) g.saved = Math.min(g.target, g.saved + amt); }); remind(u.id, "Top-up received", `${naira(amt)} added to your goal via Monnify.`); return j({ ok: true }); }
      case "2fa-send": { const u = need(); const t = issueToken(u.id, "2fa"); await sendMail(u.email, "Kraud withdrawal code", `Your withdrawal phrase (expires in 15 minutes): ${t.phrase}`); return j({ ok: true, exp: t.exp, ...dev({ devPhrase: t.phrase }) }); }
      case "withdraw": {
        const u = need(); if (!u.kyc) return err("Complete one-off KYC first");
        const r = useToken(u.id, "2fa", String(b.phrase || "")); if (r !== "ok") return err(r === "expired" ? "Phrase expired after 15 minutes — request a new one" : "Wrong 2FA phrase");
        tx((db) => { const g = db.goals.find((x) => x.id === b.goalId && x.userId === u.id); if (g) g.saved = 0; }); remind(u.id, "Withdrawal approved", "Funds sent to your bank account (demo)."); return j({ ok: true });
      }
      case "chat-start": { const u = need(); const l = load().listings.find((x) => x.id === b.listingId); if (!l) return err("Listing not found"); if (l.seller === u.id) return err("You can't chat yourself");
        const id = tx((db) => { let t = db.threads.find((x) => x.buyer === u.id && x.listingId === l.id); if (!t) { t = { id: uid("c_"), buyer: u.id, seller: l.seller, sellerName: l.sellerName, listingId: l.id, msgs: [{ from: l.seller, text: `Hello! Thanks for your interest in ${l.title}. Happy to arrange an inspection.`, at: Date.now() }] }; db.threads.unshift(t); } return t.id; }); return j({ ok: true, id }); }
      case "chat-send": { const u = need(); const text = String(b.text || "").trim().slice(0, 1000); if (!text) return err("Empty");
        tx((db) => { const t = db.threads.find((x) => x.id === b.id && x.buyer === u.id); if (!t) throw new Error("Thread not found"); t.msgs.push({ from: u.id, text, at: Date.now() }); const replies = ["Noted. Inspection slots: Saturday 10am or 2pm — which works?", "Title is Governor's consent; documents shared after KYC.", "Payments go through Kraud escrow, released after handover.", "Sure, I can share a video walk-through today."]; t.msgs.push({ from: t.seller, text: replies[t.msgs.length % replies.length], at: Date.now() + 1500 }); }); return j({ ok: true }); }
      case "read-all": { const u = need(); tx((db) => db.reminders.forEach((r) => { if (r.userId === u.id) r.read = true; })); return j({ ok: true }); }
      case "seed-add": if (!isAdmin(me)) return err("Admins only", 403); return j({ ok: true, ...seedAdd() });
      case "seed-remove": if (!isAdmin(me)) return err("Admins only", 403); return j({ ok: true, ...seedRemove() });
      case "moderate": if (!isAdmin(me)) return err("Admins only", 403); tx((db) => { const l = db.listings.find((x) => x.id === b.id); if (l) l.moderation = b.status; }); return j({ ok: true });
      default: return err("Unknown action", 404);
    }
  } catch (e: any) { return err(e.message || "Error"); }
}
