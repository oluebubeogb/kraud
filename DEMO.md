# Kraud — demo script (production build)

The demo runs on the real build: Postgres, real Monnify checkout (sandbox keys), real SMTP email, real PDF receipts. Nothing is mocked once keys are set.

## 0. Prep (admin)
1. Sign up as `admin` (it's in `KRAUD_ADMINS`). Verify via the email link.
2. **Admin → Sample seed data → Add seed data.** One click creates 11 nationwide listings (Lagos, Abuja, Port Harcourt, Enugu, **Umuahia**…), 4 KYC-verified sample sellers (password `suya abuja`, e.g. `adebayohomes`, `umuahiaestates`) and sample buyer `ada` / `jollof lekki`. Files go to `/data/uploads/seed`. **Remove seed data** deletes rows, sample users and files.

## 1. Buyer flow
1. Sign up (Buy / invest), set a normal password (8+ chars, with a number or symbol), eye toggle shows it; a Nigerian-word verification phrase is emailed. Log in with username **or** email.
2. Explore: Featured slots — Search (top card), Recommended (carousel), Sidebar (desktop), Footer, Immersive (property page). Filter by city / stage.
3. Open a listing → **Buy now** → first time only: one-off NIN/BVN KYC (status: under review → admin approves, or auto with `KYC_PROVIDER=monnify`).
4. Pay 30% deposit → Monnify sandbox checkout (use the sandbox test cards listed in Monnify's developer docs, or bank transfer). Returns to the receipt; webhook also confirms.
5. Receipt shows **Paid · in escrow**; **Download PDF** (also emailed as attachment, stored in `/data/receipts`).
6. **Chat with seller** — 1-on-1, the seller replies for real.
7. Savings: "Save toward this home" → Top-up via Monnify → Withdraw needs KYC + emailed 2-word 2FA phrase (15-minute expiry) + bank/NUBAN.
8. Forgot password → emailed Nigerian 2-word reset phrase (same for 2FA withdrawals), 15-minute expiry, 5 attempts.

## 2. Seller flow
1. Log in as a sample seller (or Profile → Become a seller → KYC).
2. **Seller dashboard**: buyer inbox (reply in real time), listings, sales with escrow status, Featured placement booking — unique Meta-style daily rate per slot/city, forecast reach, pay via Monnify; activates on payment.
3. New listing → upload photo → submitted as **Pending** until admin approves.

## 3. Admin flow
- KYC queue (approve/reject, masked NIN/BVN only) · Escrow held → **Flag diligence OK** → **Release** (release is locked until diligence is flagged) or Refund · Withdrawals · Pricing grid with per-slot **minimum daily rates** · Listing moderation + manual Featured toggles · Ledger balances.

## 4. Mobile
Install the PWA (Add to Home Screen) or ship the Capacitor apps in `native/`.
