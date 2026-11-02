import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
const checkPassphrase = (p: string) => p.length < 8 ? "Password must be at least 8 characters" : p.length > 128 ? "Password is too long" : !/[A-Za-z]/.test(p) || !/[^A-Za-z]/.test(p) ? "Use letters plus at least one number or symbol" : null;
import { checkPw, clearSession, currentUser, findLogin, hashPw, isAdmin, issueToken, kycOk, setSession, useToken, type Me } from "@/lib/auth";
import { devMail, sendMail } from "@/lib/mail";
import { seedAdd, seedRemove } from "@/lib/seed";
import { naira } from "@/lib/format";
import { appUrl } from "@/lib/db";
import { limited } from "@/lib/secure";
import { submitKyc } from "@/lib/kyc";
import { escrowFee, finalize, remind, startPayment, newRef } from "@/lib/payments";
import { simulatorOn, disburse } from "@/lib/monnify";
import { quote, SLOTS } from "@/lib/pricing";
import { STATUSES } from "@/lib/listings";
const j = (d: unknown, s = 200) => NextResponse.json(d, { status: s });
const err = (e: string, s = 400) => j({ error: e }, s);
const dev = (o: Record<string, unknown>) => (devMail() ? o : {});
const tokMsg = (r: string, what: string) => r === "expired" ? `${what} expired after 15 minutes — request a new one` : r === "locked" ? `Too many wrong attempts — request a new ${what.toLowerCase()}` : `Wrong ${what.toLowerCase()}`;
const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
class E extends Error { constructor(m: string, public s = 400) { super(m); } }

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const origin = req.headers.get("origin"); if (origin && new URL(origin).host !== req.headers.get("host") && !origin.startsWith(appUrl())) return err("Bad origin", 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited("api:" + ip, 120, 60_000)) return err("Too many requests, slow down", 429);
  const b = await req.json().catch(() => ({} as any));
  const me = await currentUser();
  const need = (): Me => { if (!me) throw new E("Please sign in", 401); return me; };
  const admin = () => { if (!isAdmin(me)) throw new E("Admins only", 403); return me!; };
  const seller = () => { const u = need(); if (u.role !== "SELLER") throw new E("Seller account required"); if (!kycOk(u)) throw new E("Complete one-off KYC before selling"); return u; };
  try {
    switch (action) {
      case "signup": {
        if (limited("signup:" + ip, 10, 3600e3)) return err("Too many sign-ups from this network", 429);
        const username = str(b.username).toLowerCase(), email = str(b.email).toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(username)) return err("Username: 3–20 letters, numbers or _");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Enter a valid email");
        const pe = checkPassphrase(String(b.password || "")); if (pe) return err(pe);
        if (await findLogin(username) || await findLogin(email)) return err("Username or email already in use");
        const isSeller = b.role === "SELLER";
        const u = await prisma.user.create({ data: { username, email, name: str(b.name, 80) || username, ...hashPw(b.password), role: isSeller ? "SELLER" : "BUYER", businessName: isSeller ? str(b.businessName, 80) || null : null } });
        const t = await issueToken(u.id, "verify");
        const link = `${appUrl()}/verify?u=${u.id}&p=${encodeURIComponent(t.phrase)}`;
        await sendMail(email, "Verify your Kraud account", `Welcome to Kraud, ${u.name}.\n\nYour verification phrase: ${t.phrase}\nOr open: ${link}\n\nThis link is valid for 24 hours.`);
        await setSession(u.id); await remind(u.id, "Verify your email", "Confirm your email to unlock buying, selling and withdrawals.");
        return j({ ok: true, ...dev({ devLink: link }) });
      }
      case "login": {
        const id = str(b.id).toLowerCase(); if (limited("login:" + id, 8, 15 * 60e3) || limited("loginip:" + ip, 30, 15 * 60e3)) return err("Too many attempts. Try again in 15 minutes.", 429);
        const u = await findLogin(id); if (!u || !checkPw(u, String(b.password || ""))) return err("Wrong username/email or password", 401);
        await setSession(u.id); return j({ ok: true });
      }
      case "logout": await clearSession(); return j({ ok: true });
      case "resend-verify": { const u = need(); if (limited("rv:" + u.id, 5, 3600e3)) return err("Please wait before resending", 429); const t = await issueToken(u.id, "verify"); const link = `${appUrl()}/verify?u=${u.id}&p=${encodeURIComponent(t.phrase)}`; await sendMail(u.email, "Verify your Kraud account", `Your verification phrase: ${t.phrase}\n${link}`); return j({ ok: true, ...dev({ devLink: link }) }); }
      case "verify": { const r = await useToken(str(b.u), "verify", str(b.p)); if (r !== "ok") return err(r === "expired" ? "Link expired — resend from the app" : "Invalid verification phrase"); await prisma.user.update({ where: { id: str(b.u) }, data: { verified: true } }); return j({ ok: true }); }
      case "forgot": {
        if (limited("forgot:" + ip, 10, 3600e3)) return err("Too many requests", 429);
        const u = await findLogin(str(b.id)); if (!u) return j({ ok: true });
        const t = await issueToken(u.id, "reset"); await sendMail(u.email, "Kraud password reset", `Your reset phrase (valid 15 minutes): ${t.phrase}\n\nIf you didn't ask for this, ignore this email.`);
        return j({ ok: true, ...dev({ devPhrase: t.phrase }) });
      }
      case "reset": {
        const u = await findLogin(str(b.id)); if (!u) return err("Invalid reset phrase");
        const pe = checkPassphrase(String(b.password || "")); if (pe) return err(pe);
        const r = await useToken(u.id, "reset", str(b.phrase)); if (r !== "ok") return err(tokMsg(r, "Reset phrase"));
        await prisma.user.update({ where: { id: u.id }, data: hashPw(b.password) }); await prisma.session.deleteMany({ where: { userId: u.id } }); return j({ ok: true });
      }
      case "kyc": {
        const u = need(); if (!u.verified) return err("Verify your email first");
        const nin = str(b.nin), bvn = str(b.bvn), phone = str(b.phone).replace(/\D/g, ""), dob = str(b.dob), legalName = str(b.legalName, 100);
        if (!/^\d{11}$/.test(nin) || !/^\d{11}$/.test(bvn)) return err("NIN and BVN must be 11 digits");
        if (!/^0\d{10}$|^234\d{10}$/.test(phone)) return err("Enter a Nigerian phone number"); if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return err("Enter date of birth"); if (legalName.split(/\s+/).length < 2) return err("Enter your full legal name");
        const k = await submitKyc(u.id, { nin, bvn, phone, dob, legalName });
        await remind(u.id, k.status === "VERIFIED" ? "KYC verified" : "KYC submitted", k.status === "VERIFIED" ? "One-off identity check complete. You can buy, sell and withdraw." : "We're reviewing your identity. You'll be notified once approved.");
        return j({ ok: true, status: k.status });
      }
      case "pay": {
        const u = need(); if (!u.verified) return err("Verify your email first"); if (!kycOk(u)) return err("Complete one-off KYC first");
        const l = await prisma.listing.findFirst({ where: { id: str(b.listingId), moderation: "Approved" } }); if (!l) return err("Listing not found");
        if (l.sellerId === u.id) return err("You can't buy your own listing");
        const deposit = b.mode === "deposit"; const amount = deposit ? Math.round(Number(l.price) * 0.3) : Number(l.price);
        const r = await startPayment({ user: u, kind: deposit ? "DEPOSIT" : "PURCHASE", title: l.title, amount, fee: escrowFee(amount), listingId: l.id });
        return j({ ok: true, ...r });
      }
      case "goal": { const u = need(); const l = await prisma.listing.findFirst({ where: { id: str(b.listingId), moderation: "Approved" } }); if (!l) return err("Listing not found"); const g = await prisma.goal.create({ data: { userId: u.id, listingId: l.id, title: l.title, target: l.price } }); await remind(u.id, "Savings goal created", `Saving toward ${l.title}. We'll nudge you monthly.`, new Date(Date.now() + 30 * 864e5)); return j({ ok: true, id: g.id }); }
      case "topup": {
        const u = need(); if (!u.verified) return err("Verify your email first");
        const g = await prisma.goal.findFirst({ where: { id: str(b.id), userId: u.id } }); if (!g) return err("Goal not found");
        const amt = Math.round(Number(b.amount)); if (!(amt >= 1000)) return err("Minimum top-up is ₦1,000"); if (BigInt(amt) + g.saved > g.target) return err("That would exceed the property price");
        return j({ ok: true, ...(await startPayment({ user: u, kind: "SAVINGS_TOPUP", title: "Savings: " + g.title, amount: amt, goalId: g.id })) });
      }
      case "2fa-send": { const u = need(); if (limited("2fa:" + u.id, 5, 3600e3)) return err("Too many codes requested", 429); const t = await issueToken(u.id, "2fa"); await sendMail(u.email, "Kraud withdrawal phrase", `Your withdrawal phrase (expires in 15 minutes): ${t.phrase}\n\nNever share it — Kraud staff will never ask for it.`); return j({ ok: true, exp: t.exp, ...dev({ devPhrase: t.phrase }) }); }
      case "withdraw": {
        const u = need(); if (!kycOk(u)) return err("Complete one-off KYC first");
        const bankCode = str(b.bankCode), acct = str(b.accountNumber); if (!/^\d{3,6}$/.test(bankCode) || !/^\d{10}$/.test(acct)) return err("Enter a valid bank and 10-digit NUBAN");
        const r = await useToken(u.id, "2fa", str(b.phrase)); if (r !== "ok") return err(tokMsg(r, "2FA phrase"));
        const ref = newRef().replace("KRD", "WDR");
        const w = await prisma.$transaction(async (tx) => {
          const g = await tx.goal.findFirst({ where: { id: str(b.goalId), userId: u.id } }); if (!g || g.saved <= 0n) throw new E("Nothing to withdraw");
          await tx.goal.update({ where: { id: g.id }, data: { saved: 0n } });
          await tx.ledgerEntry.createMany({ data: [{ account: "SAVINGS_LIABILITY", amount: -g.saved, memo: "Withdrawal " + ref }, { account: "PAYOUTS_PENDING", amount: g.saved, memo: "Withdrawal " + ref }] });
          return tx.withdrawal.create({ data: { userId: u.id, goalId: g.id, amount: g.saved, bankCode, accountNumber: acct, providerRef: ref } });
        });
        try { const d: any = await disburse({ ref, amountNaira: Number(w.amount), bankCode, accountNumber: acct, narration: "Kraud savings withdrawal" }); if (d) await prisma.withdrawal.update({ where: { id: w.id }, data: { status: "SENT:" + (d.status || "PENDING") } }); } catch (e) { console.error("disburse", e); }
        await remind(u.id, "Withdrawal requested", `${naira(Number(w.amount))} to account ****${acct.slice(-4)}. Ref ${ref}.`); return j({ ok: true });
      }
      case "chat-start": {
        const u = need(); const l = await prisma.listing.findFirst({ where: { id: str(b.listingId), moderation: "Approved" } }); if (!l) return err("Listing not found"); if (l.sellerId === u.id) return err("This is your own listing");
        const t = await prisma.thread.upsert({ where: { buyerId_listingId: { buyerId: u.id, listingId: l.id } }, update: {}, create: { buyerId: u.id, sellerId: l.sellerId, listingId: l.id } }); return j({ ok: true, id: t.id });
      }
      case "chat-send": {
        const u = need(); const text = str(b.text, 1000); if (!text) return err("Empty"); if (limited("msg:" + u.id, 30, 60e3)) return err("Slow down", 429);
        const t = await prisma.thread.findFirst({ where: { id: str(b.id), OR: [{ buyerId: u.id }, { sellerId: u.id }] } }); if (!t) return err("Conversation not found", 404);
        await prisma.message.create({ data: { threadId: t.id, fromId: u.id, text } }); await prisma.thread.update({ where: { id: t.id }, data: { updatedAt: new Date() } });
        const other = t.buyerId === u.id ? t.sellerId : t.buyerId; const unread = await prisma.reminder.count({ where: { userId: other, read: false, title: "New message from " + u.name } });
        if (!unread) await remind(other, "New message from " + u.name, text.slice(0, 120));
        return j({ ok: true });
      }
      case "chat-read": { const u = need(); await prisma.message.updateMany({ where: { threadId: str(b.id), fromId: { not: u.id }, readAt: null, thread: { OR: [{ buyerId: u.id }, { sellerId: u.id }] } }, data: { readAt: new Date() } }); return j({ ok: true }); }
      case "read-all": { const u = need(); await prisma.reminder.updateMany({ where: { userId: u.id }, data: { read: true } }); return j({ ok: true }); }
      case "become-seller": { const u = need(); await prisma.user.update({ where: { id: u.id }, data: { role: "SELLER", businessName: str(b.businessName, 80) || u.name } }); return j({ ok: true }); }
      case "listing-save": {
        const u = seller(); const price = Math.round(Number(b.price)); const n = (v: unknown) => Math.max(0, Math.min(999, Math.round(Number(v) || 0)));
        const data = { title: str(b.title, 100), city: str(b.city, 40), estate: str(b.estate, 100), state: str(b.state, 40), price: BigInt(price), beds: n(b.beds), baths: n(b.baths), sqm: Math.max(0, Math.round(Number(b.sqm) || 0)), status: STATUSES.includes(b.status) ? b.status : "Completed", type: str(b.type, 40) || "House", desc: str(b.desc, 2000), img: str(b.img, 300) };
        if (!data.title || !data.city || !data.estate || !data.state || !(price >= 100000)) return err("Fill title, city, estate, state and a price (≥ ₦100,000)");
        let imgs: string[] = []; try { imgs = (Array.isArray(b.imgs) ? b.imgs : JSON.parse(String(b.imgs || "[]"))).map((x: unknown) => str(x, 300)).filter((x: string) => x.startsWith("/media/listings/")).slice(0, 12); } catch {}
        if (data.img && !imgs.includes(data.img)) imgs.unshift(data.img); if (imgs.length) data.img = imgs[0];
        if (data.img && !data.img.startsWith("/media/listings/")) return err("Upload a photo");
        if (b.id) { const l = await prisma.listing.findFirst({ where: { id: str(b.id), sellerId: u.id } }); if (!l) return err("Not your listing", 403); await prisma.listing.update({ where: { id: l.id }, data: { ...data, img: data.img || l.img, files: imgs.length ? [...imgs, ...l.files.filter((f) => !f.startsWith("/media/listings/"))] : l.files, moderation: "Pending" } }); return j({ ok: true, id: l.id }); }
        const l = await prisma.listing.create({ data: { ...data, sellerId: u.id, moderation: "Pending", files: imgs } }); return j({ ok: true, id: l.id });
      }
      case "listing-delete": { const u = seller(); const l = await prisma.listing.findFirst({ where: { id: str(b.id), sellerId: u.id }, include: { payments: { where: { status: "HELD" } } } }); if (!l) return err("Not your listing", 403); if (l.payments.length) return err("A buyer's funds are in escrow on this listing"); await prisma.listing.delete({ where: { id: l.id } }); return j({ ok: true }); }
      case "placement-book": {
        const u = seller(); const slot = str(b.slot); if (!(SLOTS as readonly string[]).includes(slot)) return err("Unknown slot"); const days = Math.max(1, Math.min(90, Math.round(Number(b.days) || 7)));
        const l = await prisma.listing.findFirst({ where: { id: str(b.listingId), sellerId: u.id, moderation: "Approved" } }); if (!l) return err("Pick one of your approved listings");
        const q = await quote(slot, l.city); const pl = await prisma.placement.create({ data: { listingId: l.id, slot, city: l.city, dailyRate: BigInt(q.daily), days } });
        return j({ ok: true, ...(await startPayment({ user: u, kind: "PLACEMENT", title: `Featured ${slot} · ${l.title} · ${days}d`, amount: q.daily * days, listingId: l.id, placementId: pl.id })) });
      }
      case "sim-pay": {
        if (!simulatorOn()) return err("Simulator is disabled", 403); const u = need();
        const p = await prisma.payment.findFirst({ where: { ref: str(b.ref), userId: u.id } }); if (!p) return err("Unknown payment");
        await finalize(p.ref, { amountPaid: Number(p.amount + p.fee), method: "Simulator · " + str(b.method, 30), providerRef: p.providerRef || undefined }); return j({ ok: true, ref: p.ref });
      }
      // ——— admin ———
      case "seed-add": admin(); return j({ ok: true, ...(await seedAdd()) });
      case "seed-remove": admin(); return j({ ok: true, ...(await seedRemove()) });
      case "moderate": { admin(); const l = await prisma.listing.update({ where: { id: str(b.id) }, data: { moderation: b.status === "Approved" ? "Approved" : "Hidden" } }); await remind(l.sellerId, `Listing ${l.moderation.toLowerCase()}`, l.title); return j({ ok: true }); }
      case "feature-toggle": { admin(); const l = await prisma.listing.findUniqueOrThrow({ where: { id: str(b.id) } }); const s = str(b.slot); await prisma.listing.update({ where: { id: l.id }, data: { featured: l.featured.includes(s) ? l.featured.filter((x) => x !== s) : [...l.featured, s] } }); return j({ ok: true }); }
      case "kyc-decide": { const a = admin(); const k = await prisma.kyc.update({ where: { userId: str(b.userId) }, data: { status: b.approve ? "VERIFIED" : "REJECTED", decidedAt: new Date(), decidedBy: a.username, note: str(b.note) || null } }); await remind(k.userId, b.approve ? "KYC verified" : "KYC rejected", b.approve ? "You can now buy, sell and withdraw." : "Please contact support to resubmit."); return j({ ok: true }); }
      case "escrow-diligence": { const a = admin(); await prisma.payment.update({ where: { ref: str(b.ref), status: "HELD" }, data: { diligenceOk: !!b.ok, diligenceNote: str(b.note, 500) || null, diligenceBy: a.username } }); return j({ ok: true }); }
      case "escrow-release": case "escrow-refund": {
        const a = admin(); const release = action === "escrow-release";
        const p = await prisma.payment.findUnique({ where: { ref: str(b.ref) }, include: { listing: true } }); if (!p || p.status !== "HELD") return err("Payment is not held in escrow");
        if (release && !p.diligenceOk) return err("Flag due diligence complete before releasing");
        const done = await prisma.$transaction(async (tx) => {
          const f = await tx.payment.updateMany({ where: { ref: p.ref, status: "HELD" }, data: { status: release ? "RELEASED" : "REFUNDED", releasedAt: new Date() } }); if (!f.count) return false;
          await tx.ledgerEntry.createMany({ data: [{ paymentId: p.id, account: "ESCROW_HELD", amount: -p.amount, memo: (release ? "Released by " : "Refunded by ") + a.username }, { paymentId: p.id, account: release ? "SELLER_PAYABLE" : "BUYER_REFUND_PAYABLE", amount: p.amount, memo: p.title }] });
          return true;
        });
        if (done) { await remind(p.userId, release ? "Escrow released" : "Escrow refunded", `${naira(Number(p.amount))} for ${p.title}.`); if (p.listing) await remind(p.listing.sellerId, release ? "Funds released to you" : "Buyer refunded", `${naira(Number(p.amount))} · ${p.title}`); }
        return j({ ok: true });
      }
      case "min-rate": { admin(); const v = Math.round(Number(b.value)); if (!(SLOTS as readonly string[]).includes(str(b.slot)) || !(v >= 0)) return err("Bad rate"); await prisma.setting.upsert({ where: { key: "min:" + str(b.slot) }, create: { key: "min:" + str(b.slot), value: String(v) }, update: { value: String(v) } }); return j({ ok: true }); }
      case "withdrawal-mark": { admin(); await prisma.withdrawal.update({ where: { id: str(b.id) }, data: { status: "PAID" } }); return j({ ok: true }); }
      default: return err("Unknown action", 404);
    }
  } catch (e: any) { if (!(e instanceof E)) console.error(action, e); return err(e instanceof E ? e.message : e?.message?.startsWith("Monnify") || e?.message?.includes("configured") ? e.message : "Something went wrong", e.s || 400); }
}
