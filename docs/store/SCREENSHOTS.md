# Store screenshots

`screenshots.cjs` captures every store-required size from the live web app with Playwright,
optionally wrapped in a brand-colored frame with a caption. No device mockups are needed;
both stores accept plain captures, and the framed version reads well in the listing.

## Sizes produced

| Platform | Folder | Pixels | Store requirement |
|---|---|---|---|
| iOS | `ios/iphone-6.9` | 1320 x 2868 | iPhone 6.9" display (required since 2024; Apple scales it for smaller phones) |
| iOS | `ios/iphone-6.5` | 1284 x 2778 | iPhone 6.5" (optional, older device slot) |
| iOS | `ipad-13` | 2064 x 2752 | iPad 13" (required only if the app supports iPad; it does) |
| Android | `android/phone` | 1080 x 1920 | Phone screenshots, 16:9, min 320px, max 3840px |

Apple wants 3 to 10 per device size, Google 2 to 8. The script captures five pages.

## Usage

1. Deploy the web app and sign in with the review/demo account in a desktop browser.
2. Create one snap and stop at the review screen; copy its id from the URL
   (`/snaps/<id>/review`).
3. Copy the session cookie value from DevTools (Application, Cookies, `session`).
4. Run from the repo root:

```bash
node docs/store/screenshots.cjs \
  --base https://flyercal.app \
  --cookie session=PASTE_VALUE \
  --snap PASTE_SNAP_ID \
  --frame
```

Add `--platform ios` or `--platform android` to capture one store, and `--out <dir>` to change
the output folder (default `docs/store/screenshots/`, which is git-ignored at the repo root
`.gitignore` if you add it; keep large PNGs out of git).

Playwright must be installed where you run it: `npm i -D playwright && npx playwright install chromium`
(the repo's cloud sessions already have it).

## Tips

- Seed the demo family with a few confirmed events first so the Home capture isn't the empty state.
- Captions come from the `PAGES` list in the script; keep them under about 40 characters.
- Google Play also wants a 1024 x 500 feature graphic. Make it from
  `apps/flyercal-native/resources/icon.svg` on the brand color with the app name; any image
  editor works.
- The App Store "App Preview" video is optional; skip it for 1.0.
