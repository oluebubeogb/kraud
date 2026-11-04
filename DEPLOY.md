# Deploying Kraud on Coolify

Production stack: Next.js 15 (standalone) · Postgres 16 (Prisma migrations) · Monnify · SMTP · persistent `/data` volume.

## Option A — Docker Compose (app + Postgres in one resource)
1. Coolify → **New Resource → Docker Compose**, point it at this repo; it uses `docker-compose.yml` (services `kraud` + `db`).
2. Environment variables: copy every key from `.env.example`. Mandatory in production:
   - `APP_URL` (https URL Coolify serves), `KRAUD_SECRET` (`openssl rand -hex 32`), `KRAUD_ADMINS`
   - `POSTGRES_PASSWORD` (compose builds `DATABASE_URL` from it)
   - `SMTP_HOST/PORT/USER/PASS/FROM` — **required**; without SMTP, sign-up / reset / 2FA return a clear error in production
   - `MONNIFY_API_KEY`, `MONNIFY_SECRET_KEY`, `MONNIFY_CONTRACT_CODE`, `MONNIFY_ENV=sandbox|live`
3. Volumes `kraud-data` (→ `/data`: uploads, PDF receipts, seed files) and `kraud-pg` are persistent — do not delete them on redeploy.
4. Domain → port **3000**. Deploy. The container runs `prisma migrate deploy` on every start (Prisma CLI is installed in full at `/opt/prisma-cli` in the image), then `node server.js`. Health: `GET /api/health`.

## Option B — Dockerfile + Coolify-managed Postgres
Create a Postgres database in Coolify, copy its internal URL to `DATABASE_URL`, deploy this repo with **Build pack: Dockerfile**, add a persistent storage mount at `/data`.

## Monnify
- Dashboard → Developer → Webhook URL: `https://<APP_URL>/api/webhooks/monnify` (enable Successful Transaction, Disbursement events). Signatures (`monnify-signature`, HMAC-SHA512 with your secret key) are verified; duplicates are ignored.
- Redirect after checkout is `/pay/return?ref=…`; the server re-verifies with Monnify (`/api/v2/transactions/{ref}`) — query params are never trusted.
- Start with `MONNIFY_ENV=sandbox` + sandbox keys, test a card payment, then switch to live keys and `MONNIFY_ENV=live`.
- Withdrawals: set `MONNIFY_WALLET_ACCOUNT` to auto-disburse via `/api/v2/disbursements/single`; otherwise they queue in Admin → Withdrawals for manual payout + "Mark paid".

## KYC (`KYC_PROVIDER`)
- `manual` (prod default): NIN/BVN encrypted (AES-GCM, key from `KRAUD_SECRET`), queued for Admin → KYC review.
- `monnify`: Monnify VAS NIN lookup + BVN match auto-verifies on match; mismatches fall to manual review. Requires VAS enabled on your Monnify account (billed per call).
- `sandbox`: auto-verifies valid-format numbers — dev only.
**Don't rotate `KRAUD_SECRET` after launch** — it encrypts stored NIN/BVN and signs sessions.

## Admins
Only usernames/emails in `KRAUD_ADMINS` get the Admin console. Sign up with that username/email, verify by email.

## Backups
Back up the Postgres volume (Coolify scheduled backups) **and** `/data` (receipts + uploads).

## Local dev
```bash
cp .env.example .env.local   # set NODE_ENV=development, DATABASE_URL to a local Postgres, leave SMTP/Monnify empty
npm install && npx prisma migrate dev && npm run dev
```
With empty SMTP and Monnify keys outside production you get a console mail fallback and a local payment simulator (`/pay/simulate/…`). Both are hard-disabled when `NODE_ENV=production`.

## Native apps
See `native/README.md` (Capacitor Android + iOS shells pointed at `APP_URL`).

## Harmonized co-own release (Nov 2026)
- New migration `20261102170000_harmonized_coown` (applied automatically by `prisma migrate deploy` at container start). It adds co-own listing fields, InvestmentUnit, UnitSale, SavingsVault, WalletTx, Referral, user wallet/photo/referral code, and converts any legacy `HELD` payments to `PAID`. There is **no escrow** step any more.
- Existing users get a referral code lazily on first Profile view; seed data (Admin → Add seed data) includes co-own samples.
- Fees, insurer name, referral reward and vault rates are edited in **Admin → Fees, rates & rewards** (stored in the `Setting` table; no env vars needed).
- Wallet payments settle instantly; Monnify payments still confirm via the existing webhook `/api/monnify/webhook`.

### Nov 2026 update
- New migration `20261104000000_listing_kind` adds `Listing.kind` (`PROPERTY`|`AUTO`|`OTHER`, default PROPERTY), `attrs` JSONB and `videos` TEXT[]. It is applied automatically at container start, and existing listings stay PROPERTY.
- Seed media ships in `public/seed/` (photos, `avatars/`, `video/`), so nothing is hotlinked. The Dockerfile already copies `public/`. This adds about 8 MB of photos plus the videos to the image.
- Seed accounts all use the password `Password`. After a demo on a public instance, change those passwords or remove the seed data.

### Payments: Bannk (Monnify-compatible) or Monnify direct
Kraud speaks the Monnify API. Bannk Dev Mode exposes that same API, so switching providers changes only env values, not code:
```
PAYMENT_PROVIDER=bannk
MONNIFY_BASE_URL=https://<bannk-public-url>      # required for bannk
MONNIFY_API_KEY=<Bannk Dev Mode API key>
MONNIFY_SECRET_KEY=<Bannk Dev Mode secret key>   # also verifies webhook HMAC-SHA512
MONNIFY_CONTRACT_CODE=<Bannk Dev Mode contract code>
```
In Bannk Dev Mode, set the webhook to `${APP_URL}/api/webhooks/monnify`.
To go direct to Monnify, set `PAYMENT_PROVIDER=monnify`, set `MONNIFY_ENV=sandbox|live` and use your Monnify keys. MONNIFY_BASE_URL is optional in that case.
If `PAYMENT_PROVIDER=bannk` is set without `MONNIFY_BASE_URL`, payments report "unconfigured" instead of falling back to Monnify.
