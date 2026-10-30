#!/usr/bin/env node
/**
 * Store screenshot capture for Snap Schedule.
 *
 * Usage:
 *   node docs/store/screenshots.cjs --base https://snapschedule.app --cookie session=<value> --snap <snapId>
 *     [--platform ios|android|all] [--frame] [--out docs/store/screenshots]
 *
 * --cookie   name=value of a signed-in session cookie (copy from the browser dev tools).
 * --snap     id of a snap in needs_review state so /snaps/<id>/review has content.
 * --frame    wrap each capture in a brand-colored frame with a caption (device-free, store-safe).
 *
 * Requires the Playwright package with a Chromium download (`npm i -D playwright && npx playwright install chromium`),
 * or run it from the repo's cloud session where Playwright is preinstalled.
 */
const path = require("path");
const fs = require("fs");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith("--") ? true : v;
}

const BASE = String(arg("base", "http://localhost:3000")).replace(/\/$/, "");
const COOKIE = arg("cookie", null);
const SNAP = arg("snap", null);
const PLATFORM = String(arg("platform", "all"));
const FRAME = arg("frame", false) === true;
const OUT = path.resolve(String(arg("out", path.join(__dirname, "screenshots"))));
const BRAND = "#4F46E5";

// Store-required pixel sizes. Playwright viewport is CSS pixels, so viewport = size / scale.
const TARGETS = [
  { platform: "ios", name: "iphone-6.9", width: 1320, height: 2868, scale: 3 },
  { platform: "ios", name: "iphone-6.5", width: 1284, height: 2778, scale: 3 },
  { platform: "ios", name: "ipad-13", width: 2064, height: 2752, scale: 2 },
  { platform: "android", name: "phone", width: 1080, height: 1920, scale: 2.5 },
];

const PAGES = [
  { path: "/", name: "01-home", caption: "Your whole family's month, one glance" },
  { path: "/snap", name: "02-snap", caption: "Snap a newsletter, flyer, or screenshot" },
  { path: SNAP ? `/snaps/${SNAP}/review` : null, name: "03-review", caption: "Review, fix, confirm. Nothing lands unchecked" },
  { path: "/family", name: "04-family", caption: "Color-code every kid, see who's driving" },
  { path: "/subscribe", name: "05-subscribe", caption: "Syncs with the calendar you already use" },
].filter((p) => p.path);

function frameHtml({ dataUrl, caption, width, height }) {
  // Caption band on top (~14% of height), screenshot scaled to fit below with rounded corners.
  const band = Math.round(height * 0.14);
  const pad = Math.round(width * 0.06);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${width}px;height:${height}px;background:${BRAND};overflow:hidden}
    body{font-family:-apple-system,system-ui,"Segoe UI",Roboto,sans-serif;color:#fff;display:flex;flex-direction:column}
    .cap{height:${band}px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 ${pad}px;font-weight:700;font-size:${Math.round(width * 0.055)}px;line-height:1.15;letter-spacing:-0.01em}
    .shot{flex:1;padding:0 ${pad}px ${pad}px;display:flex;justify-content:center;align-items:flex-start}
    img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:${Math.round(width * 0.04)}px;box-shadow:0 ${Math.round(width*0.02)}px ${Math.round(width*0.06)}px rgba(0,0,0,.35);background:#fff}
  </style></head><body>
    <div class="cap">${caption.replace(/</g, "&lt;")}</div>
    <div class="shot"><img src="${dataUrl}"></div>
  </body></html>`;
}

(async () => {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch {
    console.error("playwright is not installed. Run: npm i -D playwright && npx playwright install chromium");
    process.exit(1);
  }
  if (!COOKIE || COOKIE === true) {
    console.error("Missing --cookie name=value (a signed-in session cookie). Pages will redirect to /login otherwise.");
  }
  const targets = TARGETS.filter((t) => PLATFORM === "all" || t.platform === PLATFORM);
  const browser = await chromium.launch();
  let failures = 0;

  for (const t of targets) {
    const vw = Math.round(t.width / t.scale);
    const vh = Math.round(t.height / t.scale);
    const ctx = await browser.newContext({
      viewport: { width: vw, height: vh },
      deviceScaleFactor: t.scale,
      isMobile: t.platform !== "ios" || !t.name.startsWith("ipad"),
      hasTouch: true,
      colorScheme: "light",
      locale: "en-US",
      timezoneId: "America/New_York",
    });
    if (COOKIE && COOKIE !== true) {
      const [name, ...rest] = String(COOKIE).split("=");
      await ctx.addCookies([{ name, value: rest.join("="), url: BASE }]);
    }
    const dir = path.join(OUT, t.platform, t.name);
    fs.mkdirSync(dir, { recursive: true });
    const page = await ctx.newPage();

    for (const p of PAGES) {
      const file = path.join(dir, `${p.name}.png`);
      try {
        const res = await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 45000 });
        if (!res || res.status() >= 400) throw new Error(`HTTP ${res ? res.status() : "no response"}`);
        if (/\/login/.test(page.url())) throw new Error("redirected to /login (bad or missing --cookie)");
        await page.waitForTimeout(400); // let fonts settle
        if (!FRAME) {
          await page.screenshot({ path: file, fullPage: false });
        } else {
          const raw = await page.screenshot({ fullPage: false });
          const framePage = await ctx.newPage();
          await framePage.setViewportSize({ width: vw, height: vh });
          await framePage.setContent(
            frameHtml({
              dataUrl: `data:image/png;base64,${raw.toString("base64")}`,
              caption: p.caption,
              width: vw,
              height: vh,
            }),
          );
          await framePage.screenshot({ path: file, fullPage: false });
          await framePage.close();
        }
        console.log(`ok   ${t.platform}/${t.name}/${p.name}.png  (${t.width}x${t.height})`);
      } catch (err) {
        failures++;
        console.error(`FAIL ${t.platform}/${t.name}/${p.name}: ${err.message}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(failures ? `${failures} capture(s) failed` : "all captures done");
  process.exit(failures ? 1 : 0);
})();
