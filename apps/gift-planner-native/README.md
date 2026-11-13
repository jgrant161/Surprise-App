# Surprise Stash native shell (iOS + Android)

This folder is the App Store / Google Play package for Surprise Stash, the gift planner web
app (`apps/gift-planner`, deployed at `https://surprisestash.app`). It is a thin [Capacitor](https://capacitorjs.com) shell: a real
native app whose WebView loads the hosted web app. The shell adds what a website cannot:
a store listing, a home-screen icon and splash, status bar styling, haptics, and later push
notifications and in-app purchases.

Why a shell instead of a rewrite: every web deploy reaches phones instantly with no review
cycle, there is one codebase to maintain, and the native pieces that matter to users and to
App Review are added natively here as plugins. It is the same approach as
`apps/flyercal-native`; the two shells are deliberately identical in structure.

## Prerequisites (on a Mac)

- Xcode 16 or newer, with the iOS 18 simulator and command-line tools installed.
- Node 22 (same as the web app).
- Android Studio (Ladybug or newer) with an SDK Platform 35 and a device or emulator.
- Java 17 (Android Studio bundles one; `JAVA_HOME` should point at it).
- Capacitor 8 uses Swift Package Manager for iOS, so **CocoaPods is not required**.
- An Apple Developer Program membership and a Google Play Console account for distribution.

## First build

```bash
cd apps/gift-planner-native
npm install
npm run resources   # regenerates resources/icon.png + splash.png from the SVG (optional)
npm run assets      # writes every icon/splash size into ios/ and android/
npx cap sync        # copies www/, updates native plugin lists
```

### iOS

```bash
npm run open:ios    # opens ios/App/App.xcodeproj in Xcode
```

In Xcode: select the `App` target, Signing & Capabilities, tick *Automatically manage
signing* and pick your team. Set *Bundle Identifier* if you changed `appId` in
`capacitor.config.ts` (default `app.surprisestash.mobile`). Pick a simulator or your phone and press Run. Xcode resolves the Capacitor Swift
packages on first open (needs network).

Archive for TestFlight: Product, Archive, then Distribute App, App Store Connect.

### Android

```bash
npm run open:android   # opens android/ in Android Studio
```

Let Gradle sync, pick a device, press Run. For a store build: Build, Generate Signed
Bundle / APK, Android App Bundle, create an upload keystore (keep it out of git; it is
ignored by `.gitignore`), then upload the `.aab` in Play Console.

## Pointing the shell at staging

The WebView URL comes from `capacitor.config.ts` (`server.url`). Override at sync time:

```bash
SURPRISE_STASH_URL=https://staging.surprisestash.app npx cap sync
```

Rebuild in Xcode / Android Studio afterwards. `www/index.html` is only an offline fallback
page; its `SERVER_URL` constant must match the production URL.

## What was generated here and what still runs on a Mac

Generated in this repo: `ios/` and `android/` projects (`npx cap add`), `Info.plist` and
`AndroidManifest.xml` edits (portrait on phones, export compliance flag), all icon and splash
sizes (`npm run assets`), the offline page. This app needs **no camera or photo
permissions**, so none are declared.

Not run here (no Xcode / Android SDK in the build container): Swift package resolution,
Gradle sync, any compile, signing. All of that happens the first time you open each
project on your Mac.

## App Review: Guideline 4.2 "minimum functionality"

Apple rejects apps that are "just a website". Mitigations shipped in this shell:

- Native splash screen and themed status bar.
- Haptics plugin available to the web app via `window.Capacitor`.
- Offline fallback page instead of a browser error.
- Portrait-locked phone layout and safe-area insets handled by the web app.
- Outbound shopping links open in the system browser, not inside the WebView.

If a reviewer pushes back, add in this order (each is a small plugin plus a few lines in the
web app):

1. Push notifications (`@capacitor/push-notifications`): "Ava's birthday is in 14 days and
   she has no ideas yet". The strongest signal of native value and the most useful feature.
2. Share-sheet target (`@capacitor/share` plus an iOS Share Extension later) so a product
   page can be shared straight into the app as an idea.
3. Native contacts import (`@capacitor-community/contacts`) to add people with birthdays.

Sign in with Apple is **not** required: the app signs in with emailed one-time codes only and
offers no third-party social login, which is the condition that triggers that rule.

## In-app purchases with RevenueCat (next step, not yet wired)

Apple and Google require store billing for digital subscriptions, so the Pro plan is sold
through the stores and RevenueCat keeps the web app in sync. Use a **separate RevenueCat
project** from FlyerCal; the product ids are the same by convention but belong to this app.

1. In RevenueCat create products `pro_monthly` and `pro_yearly` (same ids in App Store
   Connect and Play Console) and an entitlement `pro`.
2. `npm install @revenuecat/purchases-capacitor` here, `npx cap sync`.
3. The web app's `/upgrade` page renders buttons with `data-product="pro_monthly"` /
   `data-product="pro_yearly"` and the page root carries `data-household-id`. The shell
   intercepts those clicks, calls `Purchases.configure({ apiKey, appUserID: householdId })`
   then `Purchases.purchasePackage(...)`.
4. RevenueCat posts to the web app's webhook `POST /api/webhooks/revenuecat` with
   `Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>`; the web app flips the household's
   plan. `app_user_id` **must** equal the household id so the webhook can find it.

## Versioning

Bump `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in Xcode and `versionName` /
`versionCode` in `android/app/build.gradle` for each store release. Web deploys do not need a
new native build unless a plugin or config changed.
