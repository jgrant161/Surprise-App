# FlyerCal release checklist

Work top to bottom. Items marked (once) never need repeating. Everything else repeats per release.

## 0. Before anything

- [ ] Web app deployed and healthy at the production URL (see `docs/DEPLOY.md`).
- [ ] `REVIEW_EMAIL` / `REVIEW_CODE` set in production so reviewers can sign in without an inbox.
- [ ] Seed the review family with a few confirmed events so the first screen isn't empty.
- [ ] Privacy policy live at `/privacy`, terms at `/terms`, a `/support` page or mailto link, and `SUPPORT_EMAIL` answered by a real inbox.
- [ ] Decide the final bundle id (`app.flyercal.mobile` by default). It cannot change after the first upload.

## 1. Domain and web (once)

- [ ] Buy the domain (Cloudflare Registrar or Namecheap; about $12/yr for `.app`, which forces HTTPS, a plus).
- [ ] Point it at Render: Settings -> Custom Domains in the Render service, create the `CNAME`/`ALIAS` records it shows, wait for the certificate.
- [ ] Set `APP_URL=https://flyercal.app` in the Render service Environment tab so emailed links and `.ics` feeds use the real host.
- [ ] Verify the sending domain in Resend and set `EMAIL_FROM` (for example `FlyerCal <hello@flyercal.app>`).

## 2. Apple (once)

- [ ] Enroll in the Apple Developer Program ($99/yr) at developer.apple.com. Individual enrollment takes about a day; an LLC needs a D-U-N-S number and takes longer.
- [ ] In App Store Connect: My Apps, +, New App. Platform iOS, name "FlyerCal", primary language English (U.S.), bundle id (register it under Certificates, Identifiers & Profiles first), SKU `flyercal-ios`.
- [ ] Agreements, Tax, and Banking: accept the Paid Apps agreement and add bank + tax forms (required before any subscription can be sold; can take days to clear).
- [ ] In Xcode: open `apps/flyercal-native/ios/App/App.xcodeproj`, Signing & Capabilities, automatic signing with your team. Xcode creates the certificates and profiles.

## 3. Google (once)

- [ ] Create a Google Play Console developer account ($25 once). Personal accounts now require identity verification and, for new accounts, a closed test with 12 testers for 14 days before production access. Start this early.
- [ ] Create the app: name "FlyerCal", app (not game), free, with in-app purchases.
- [ ] Use Google Play App Signing (default). Create an upload keystore in Android Studio, store it in a password manager, never commit it.
- [ ] Set up a merchant account under Monetize, Monetization setup (required for subscriptions).

## 4. RevenueCat and subscriptions (once, then per price change)

- [ ] App Store Connect: Subscriptions, create group "FlyerCal Pro"; products `pro_monthly` and `pro_yearly` with prices (suggested $3.99/mo and $39.99/yr), localized names and descriptions, review screenshot (any screenshot of the Upgrade screen).
- [ ] Play Console: Monetize, Subscriptions, same product ids `pro_monthly` / `pro_yearly`, base plans monthly and yearly.
- [ ] RevenueCat: create project, add iOS and Android apps (App Store Connect API key / Play service-account JSON), entitlement `pro`, offering `default` with both packages.
- [ ] RevenueCat: Integrations, Webhooks, URL `https://flyercal.app/api/webhooks/revenuecat`, Authorization header value = `REVENUECAT_WEBHOOK_SECRET` from the Render environment. Send a test event and confirm the web app flips the plan.
- [ ] Install `@revenuecat/purchases-capacitor` in the shell and wire the Upgrade buttons (see the shell README).
- [ ] Test with a sandbox Apple account and a Play license tester before submitting.

## 5. Store listing (per release where copy changes)

- [ ] Paste everything from `LISTING.md`: name, subtitle, description, keywords, categories, URLs, age rating, privacy answers.
- [ ] Generate screenshots with `SCREENSHOTS.md`; upload 6.9" iPhone and 13" iPad sets to Apple, phone set plus a 1024x500 feature graphic to Google.
- [ ] Upload the 1024x1024 icon from `apps/flyercal-native/resources/icon.png` where asked (Play's store icon; Apple takes it from the build).
- [ ] Fill App Review notes from `LISTING.md`, including the demo login.
- [ ] Google Data safety form from the table in `LISTING.md`; content rating questionnaire; target audience 18+; ads: no.

## 6. Build and test (per release)

- [ ] Bump versions: Xcode `MARKETING_VERSION` (1.0.0) and `CURRENT_PROJECT_VERSION` (build number, must increase); Android `versionName` / `versionCode` in `android/app/build.gradle`.
- [ ] `cd apps/flyercal-native && npx cap sync` after any config or plugin change.
- [ ] iOS: Product, Archive, Distribute, App Store Connect, Upload. Wait for processing (10-30 min), then TestFlight, add yourself and family as internal testers, install, run through snap, review, confirm, upgrade, sign out, sign in.
- [ ] Android: Build, Generate Signed Bundle, upload the `.aab` to Internal testing, add tester emails, install from the opt-in link, same run-through.
- [ ] Check the offline page (airplane mode on launch) and that the camera sheet opens from Snap.

## 7. Submit

- [ ] Apple: attach the processed build to the 1.0 version, submit for review. Typical turnaround 24-48 hours. If rejected under 4.2 (minimum functionality) add push notifications first (see shell README) and resubmit with a note describing native features.
- [ ] Google: promote the internal build to Production (or Closed testing first if the account requires the 14-day test), staged rollout 20%, then 100% after a few days without crashes.

## 8. After launch (ongoing)

- [ ] Anthropic console: set a monthly spend limit (Settings, Limits) at an amount you're comfortable with (a few dollars covers thousands of snaps at launch) and an email alert at 50%.
- [ ] Watch Render service logs and response times, Turso row counts (free tier limits), and Resend bounce rate.
- [ ] Reply to every store review in the first month; it visibly lifts ranking.
- [ ] Each web deploy ships to phones immediately. Only rebuild the native app when a plugin, permission string, icon, or the server URL changes.
