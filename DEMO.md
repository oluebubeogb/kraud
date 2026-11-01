# Kraud — Client Meeting Demo

Next.js 15 (TypeScript, App Router) + Tailwind · mobile-first PWA · no PHP.

## Run locally
```bash
cd app
cp .env.example .env.local   # already present in the zip
npm i && npm run dev         # http://localhost:3000
# or production mode: npm run build && npm start
```
Tip: open Chrome DevTools → device toolbar (iPhone 14) or open on a phone on the same Wi-Fi (`http://<laptop-ip>:3000`). Chrome → "Add to Home Screen" installs the PWA.

## Demo accounts
| Who | Login | Passphrase | Notes |
|---|---|---|---|
| Admin | sign up with username **admin** (or email **ceo@kraud.ng**) | e.g. `oga lagos` | Admin because it is listed in `KRAUD_ADMINS` (env only, never in code) |
| Buyer | `ada` or `ada@demo.kraud.ng` | `jollof lekki` | Created by the seed: email verified + KYC done |

Passphrases must be 2+ words from the Nigerian word list (`lib/words.ts`, ~180 words). SMTP is off by default, so verify links / reset phrases / 2FA phrases are printed in the terminal **and** shown as a "Dev:" chip in the UI.

## Before the meeting (30 s)
1. Sign up as **admin** → Profile → Admin console (or sidebar "Admin" on desktop).
2. Click **Seed demo data** → writes 11 listings (Lagos, Abuja, PH, Enugu, Umuahia) + cover/meta files to `$KRAUD_DATA_DIR/uploads/seed`.
3. To reset: **Remove seed data** → deletes those rows, the seeded `ada` user + her activity, and every seeded file on disk. Real user data/uploads are untouched.

## Meeting walkthrough (< 5 min)
1. **Landing** `/` → "Get started".
2. **Signup** a fresh account (try `hello world` to show the Nigerian-word rule, then `suya abuja`; tap the eye toggle). "Dev: open verify link" → verified.
3. **Explore** — city chips (Umuahia!), Completed/Carcass/Off-plan filters, labelled **Featured** slots: Search (top card), Recommended (carousel), Footer (navy strip), Sidebar (desktop width).
4. **Property** — immersive hero, **Featured · Immersive** tour card, sticky thumb-zone bar: Chat · Save · **Buy**.
5. **Buy** → one-off **KYC** (any 11-digit NIN/BVN) → 30% deposit/full → **Monnify** sheet → "simulate success" → **Receipt** (KRD-ref, ₦, WAT, Download PDF via print).
6. **Savings** — Save toward a listing, top-up chips, **Withdraw** → 2-word 2FA phrase with live 15:00 countdown (expires server-side after 15 min).
7. **Chat** — 1-on-1 with the seller (auto-replies in demo). No group chats.
8. **Reminders** (bell on Explore) — payment, KYC, savings, inspection nudges.
9. **Admin** — seed add/remove, Meta-style placement pricing grid (unique per slot × city, admin min ₦15k/day), listing moderation (Hide/Approve).

## Persistent data & Coolify
Everything runtime lives under ONE directory: `KRAUD_DATA_DIR` (default `./data`, `/data` in Docker):
```
/data/kraud-db.json        # demo datastore (users, payments, goals, chats, listings)
/data/uploads/             # user uploads (served via /media/...)
/data/uploads/seed/        # runtime seed output — created/deleted by the admin buttons
```
- `data/` is in `.gitignore` and `.dockerignore`: seeds and user files are **never committed**. Seed *templates* live in source (`lib/listings.ts`); the seed button regenerates them on the volume after any deploy.
- **Coolify:** deploy from the repo using the included `Dockerfile` → Storages → add **Persistent Volume**, destination path **`/data`** → set env `KRAUD_DATA_DIR=/data`, `KRAUD_ADMINS`, `KRAUD_SECRET`, `APP_URL`, `SMTP_*`. Redeploys keep `/data`. After first deploy: log in as admin → Seed demo data.
- `docker compose up -d --build` does the same locally (named volume `kraud-data` → `/data`).

## Known demo limitations
- Datastore is a JSON file (swap for Postgres in Phase 1); single-instance only.
- Monnify, NIN/BVN and escrow are simulated; no real money moves.
- Listing photos load from Unsplash; offline, a seeded navy/teal cover SVG is shown instead.
- Seller side of chat is auto-replies; sellers' dashboards not in this build.
- Receipt PDF = browser print-to-PDF.
- Android Studio APK / iOS wrappers come after the PWA.
