# Kraud — demo script (production build)

The demo runs on the real build: Postgres, real Monnify checkout (sandbox keys), real SMTP email, real PDF receipts. Nothing is mocked once keys are set.

## 0. Prep (admin)
1. Sign up as `admin` (it's in `KRAUD_ADMINS`). Verify via the email link.
2. **Admin → Sample seed data → Add seed data.** One click creates the **Abuja pilot** catalogue: 19 listings, all in Abuja (FCT). There are 9 real-estate listings (Maitama, Asokoro, Wuse 2, Gwarinpa, Guzape, Life Camp, Jabi, Katampe and Kubwa), 6 automobiles (Camry, Lexus RX, Hilux, GLE, Sienna and Coaster) and 4 heavy-duty machines (CAT excavator, HOWO tipper, Komatsu loader and CAT generator). Every listing has its own photos (no photo is reused) plus a video. The seed also creates 6 KYC-verified sellers with profile photos (`maitamaprime`, `capitalcrest`, `gwarinpaestates`, `jabimotors`, `wuseautohub` and `kubwaheavy`) and the buyer `ada`. **Every seed account's password is `Password`.** Re-running the seed resets those passwords and removes old seed listings.

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

## Automobile & machinery marketplace
- Seller → New listing → **What are you listing?** offers Real estate, Auto & machinery, or Other asset. Autos ask for make, model, year, mileage or engine hours, fuel, transmission, seats and condition. "Other" accepts free `key: value` lines. Any listing can add video links.
- Autos use the same Kraud model as property: co-own units, buy whole, save toward, chat with the seller, invest/buy modes, the immersive feed and the seller dashboard.
- On the detail page, **Buy whole** (cart), **Save toward** (bank notes) and **Chat** become round icon buttons. They sit on a blue-green action strip and show a label on hover or tap. The specs strip (beds/baths/m², or year/km/seats) has a light tint.
