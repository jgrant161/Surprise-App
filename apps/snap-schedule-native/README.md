# Snap Schedule native shell (iOS + Android)

This folder is the App Store / Google Play package for Snap Schedule. It is a thin
[Capacitor](https://capacitorjs.com) shell: a real native app whose WebView loads the hosted
web app (`apps/snap-schedule`, deployed at `https://snapschedule.app`). The shell adds what a
website cannot: a store listing, a home-screen icon and splash, the native camera/photo
sheet, status bar styling, haptics, and later push notifications and in-app purchases.

Why a shell instead of a rewrite: every web deploy reaches phones instantly with no review
cycle, there is one codebase to maintain, and the native pieces that matter to users and to
App Review are added natively here as plugins.

## Prerequisites (on a Mac)

- Xcode 16 or newer, with the iOS 18 simulator and command-line tools installed.
- Node 22 (same as the web app).
- Android Studio (Ladybug or newer) with an SDK Platform 35 and a device or emulator.
- Java 17 (Android Studio bundles one; `JAVA_HOME` should point at it).
- Capacitor 8 uses Swift Package Manager for iOS, so **CocoaPods is not required**. If you
  ever switch the iOS project to Pods, install CocoaPods (`brew install cocoapods`).
- An Apple Developer Program membership and a Google Play Console account for distribution.

## First build

```bash
cd apps/snap-schedule-native
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
`capacitor.config.ts` (default `app.snapschedule.mobile`). Pick a simulator or your phone
and press Run. Xcode resolves the Capacitor Swift packages on first open (needs network).

Archive for TestFlight: Product, Archive, then Distribute App, App Store Connect.

### Android

```bash
npm run open:android   # opens android/ in Android Studio
```

Let Gradle sync, pick a device, press Run. For a store build: Build, Generate Signed
Bundle / APK, Android App Bundle, create an upload keystore (keep it out of git; it is
ignored by `.gitignore`), then upload the `.aab` in Play Console. Google Play App Signing
holds the real signing key, so the upload key can be reset if lost.

## Pointing the shell at staging

The WebView URL comes from `capacitor.config.ts` (`server.url`). Override at sync time:

```bash
SNAP_SCHEDULE_URL=https://staging.snapschedule.app npx cap sync
```

Rebuild in Xcode / Android Studio afterwards. `www/index.html` is only an offline fallback
page; its `SERVER_URL` constant should match the production URL.

## What was generated here and what still runs on a Mac

Generated in this repo: `ios/` and `android/` projects (`npx cap add`), `Info.plist` and
`AndroidManifest.xml` edits (camera + photo usage strings, portrait on phones, export
compliance flag), all icon and splash sizes (`npm run assets`), the offline page.

Not run here (no Xcode / Android SDK in the build container): Swift package resolution,
Gradle sync, any compile, signing. All of that happens the first time you open each
project on your Mac.

## Camera and photos

The web app uses `<input type="file" accept="image/*" capture="environment">`. In the
shell that opens the native sheet (Take Photo / Photo Library / Files) on iOS, and on Android
goes through Capacitor's `BridgeWebChromeClient.onShowFileChooser`, which offers the camera
when `android.permission.CAMERA` is declared (it is). The usage strings live in
`ios/App/App/Info.plist` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`) and
`android/app/src/main/AndroidManifest.xml`.

## App Review: Guideline 4.2 "minimum functionality"

Apple rejects apps that are "just a website". Mitigations shipped in this shell:

- Native camera / photo-library sheet with proper permission strings.
- Native splash screen and themed status bar.
- Haptics plugin available to the web app via `window.Capacitor`.
- Offline fallback page instead of a browser error.
- Portrait-locked phone layout and safe-area insets handled by the web app.

If a reviewer still pushes back, add in this order (each is a small plugin plus a few lines in
the web app):

1. Push notifications (`@capacitor/push-notifications`) for "tomorrow: Picture Day" reminders.
   This is the strongest signal of native value and the most useful feature anyway.
2. Native share sheet (`@capacitor/share`) for sending an event to the other parent.
3. Calendar write access (`@ebarooni/capacitor-calendar` or similar) so Confirm adds events
   straight to the device calendar without the .ics step.

Sign in with Apple is **not** required: the app signs in with emailed one-time codes only and
offers no third-party social login, which is the condition that triggers that rule.

## In-app purchases with RevenueCat (next step, not yet wired)

Apple and Google require store billing for digital subscriptions, so the Pro plan is sold
through the stores and RevenueCat keeps the web app in sync.

1. In RevenueCat create products `pro_monthly` and `pro_yearly` (same ids in App Store
   Connect and Play Console) and an entitlement `pro`.
2. `npm install @revenuecat/purchases-capacitor` here, `npx cap sync`.
3. The web app's `/upgrade` page renders buttons with `data-product="pro_monthly"` /
   `data-product="pro_yearly"` and the page root carries `data-family-id`. The shell
   intercepts those clicks, calls `Purchases.configure({ apiKey, appUserID: familyId })` then
   `Purchases.purchasePackage(...)`.
4. RevenueCat posts to the web app's webhook `POST /api/webhooks/revenuecat` with
   `Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>`; the web app flips the family's plan.
   `app_user_id` **must** equal the family id so the webhook can find the family.
5. On the web (outside the shell) the same page can use Stripe instead.

## Versioning

Bump `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in Xcode and `versionName` /
`versionCode` in `android/app/build.gradle` for each store release. Web deploys do not need a
new native build unless a plugin or config changed.
