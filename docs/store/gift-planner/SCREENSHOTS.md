# Store screenshots: Surprise Stash

`screenshots.cjs` captures every store-required size from the live web app with Playwright,
optionally wrapped in a brand-colored frame with a caption. It is the same tool as
`docs/store/screenshots.cjs` for FlyerCal with this app's pages and brand color.

## Sizes produced

| Platform | Folder | Pixels | Store requirement |
|---|---|---|---|
| iOS | `ios/iphone-6.9` | 1320 x 2868 | iPhone 6.9" display (required; Apple scales it for smaller phones) |
| iOS | `ios/iphone-6.5` | 1284 x 2778 | iPhone 6.5" (optional, older device slot) |
| iOS | `ipad-13` | 2064 x 2752 | iPad 13" (required only if the app supports iPad; it does) |
| Android | `android/phone` | 1080 x 1920 | Phone screenshots, 16:9, min 320px, max 3840px |

Apple wants 3 to 10 per device size, Google 2 to 8. The script captures six pages.

## Usage

1. Deploy the web app and sign in with the review/demo account in a desktop browser.
2. Add two or three people with ideas in several statuses so the pages aren't empty, and
   copy one person's id from the URL (`/people/<id>`); pick someone other than the
   signed-in member, or the capture shows the "No peeking" page.
3. Copy the session cookie value from DevTools (Application, Cookies, `session`).
4. Run from the repo root:

```bash
node docs/store/gift-planner/screenshots.cjs \
  --base https://surprisestash.app \
  --cookie session=PASTE_VALUE \
  --person PASTE_PERSON_ID \
  --frame
```

Add `--platform ios` or `--platform android` to capture one store, and `--out <dir>` to change
the output folder (default `docs/store/gift-planner/screenshots/`, git-ignored). Playwright
must be installed where you run it.

## Tips

- Seed a couple of upcoming occasions (a birthday within 30 days and Christmas) so the
  dashboard shows countdowns and budgets.
- Google Play also wants a 1024 x 500 feature graphic. Make it from
  `apps/gift-planner-native/resources/icon.svg` on the brand color with the app name.
