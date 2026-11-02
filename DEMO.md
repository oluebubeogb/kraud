# Kraud — demo script (production build)

The demo runs on the real build: Postgres, real Monnify checkout (sandbox keys), real SMTP email, real PDF receipts. Nothing is mocked once keys are set.

## 0. Prep (admin)
1. Sign up as `admin` (it's in `KRAUD_ADMINS`). Verify via the email link.
2. **Admin → Sample seed data → Add seed data.** One click creates 11 nationwide listings (Lagos, Abuja, Port Harcourt, Enugu, **Umuahia**…), 4 KYC-verified sample sellers (password `suya abuja`, e.g. `adebayohomes`, `umuahiaestates`) and sample buyer `ada` / `jollof lekki`. Files go to `/data/uploads/seed`. **Remove seed data** deletes rows, sample users and files.

## 1. Buyer flow
1. Sign up (Buy / invest), set a normal password (8+ chars, with a number or symbol), eye toggle shows it; a Nigerian-word verification phrase is emailed. Log in with username **or** email.
2. Home shows **Welcome, {name}**, trust pills and **Invite & Earn**. Filter **Short (6 mo) / Long (12–18 mo)** and **Invest / Buy / Both**; city / stage chips. Featured slots: Search (only when searching), Recommended, Sidebar, Footer, Immersive (only in Discover).
3. Open a listing → deal sheet (per-unit price, units taken, est. profit, timeframe) → **Invest** (or **Buy whole**) → first time only: one-off NIN/BVN KYC.
4. Invest: pick units → insurance + due diligence shown → pay via **Monnify** (sandbox/simulator) or **Kraud wallet** (instant; `ada` has ₦2.5M). Units are pooled in the raise; when all units are taken the raise is **Funded**. Buy whole settles to the seller.
5. Receipt shows units, fees and **Download PDF** (also emailed, stored in `/data/receipts`).
6. **Portfolio**: units, **Total expected profit**, whole purchases. After 3 months, **Sell units** (50% of earned profit forfeited, remainder to wallet once admin settles). `ada`'s demo holding in lk-02 is 120 days old, so it's sellable.
7. **Savings & wallet**: wallet top-up / withdraw (KYC + 2FA), vaults (≤3 mo 2.5% · ≤12 mo 10% p.a., admin-set; early close forfeits interest), property goals.
8. **Profile**: photo upload, **Invite & Earn** code/link (`/signup?ref=CODE`; reward credited on the friend's first invest/buy). `ada`'s code is `ADA2026`.
9. **Chat with seller** — 1-on-1. Withdrawals need KYC + emailed 2-word 2FA phrase (15-minute expiry) + bank/NUBAN.
10. Forgot password → emailed Nigerian 2-word reset phrase (same for 2FA withdrawals), 15-minute expiry, 5 attempts.

## 2. Seller flow
1. Log in as a sample seller (or Profile → Become a seller → KYC).
2. **Seller dashboard**: buyer inbox (reply in real time), listings with raise progress, co-owner totals, whole sales, Featured placement booking — unique Meta-style daily rate per slot/city, forecast reach, pay via Monnify; activates on payment.
3. Profile photo/logo is required before publishing. New listing → photos → choose **Co-own / Buy whole / Both**, timeframe, total to raise, units (per-unit price auto), maintenance/completion, est. profit, optional fee overrides → submitted as **Pending** until admin approves.

## 3. Admin flow
- KYC queue (approve/reject, masked NIN/BVN only) · **Co-own raises** → Complete & pay profit (principal + profit to wallets) or Fail & refund (principal + fees) · **Unit sell requests** → Settle / Reject · **Fees, rates & rewards** settings · Withdrawals · Pricing grid with per-slot **minimum daily rates** · Listing moderation + manual Featured toggles · Ledger balances.

## 4. Mobile
Install the PWA (Add to Home Screen) or ship the Capacitor apps in `native/`.
