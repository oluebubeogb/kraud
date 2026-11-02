# Kraud native apps (Capacitor 7)

Android (`android/`) and iOS (`ios/`) shells that load the deployed Kraud web app — the exact same production build as the PWA, so every feature (Monnify checkout, KYC, chat, seller dashboard, PDF receipts) ships to the stores without a second codebase.

## Build
```bash
cd native
npm install
export KRAUD_APP_URL=https://kraud.yourdomain.ng   # your Coolify URL (https)
npx cap sync                                       # writes the URL into both platforms
python3 icons.py                                   # (re)generate icons + splash from ./brand (navy #002454)
```
**Android** — `npx cap open android` (Android Studio) → Build → Generate Signed Bundle (AAB) for Play Console. CLI: `cd android && ./gradlew bundleRelease`.
**iOS** — needs macOS + Xcode 15+ + CocoaPods: `cd ios/App && pod install`, then `npx cap open ios`, set your Team & bundle id `ng.kraud.app`, Product → Archive.

## Notes
- `server.allowNavigation` includes `*.monnify.com` so the Monnify checkout opens in-app and redirects back to `/pay/return`.
- App id `ng.kraud.app`, name "Kraud". Change in `capacitor.config.ts` before the first store upload.
- Store review: Apple requires the app to offer value beyond a website — Kraud's account, co-ownership portfolio, wallet and chat features qualify; include a demo login for reviewers.
