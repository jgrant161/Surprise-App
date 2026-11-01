// Renders the brand SVG to resources/icon.png (1024x1024) and resources/splash.png (2732x2732)
// using the Playwright-bundled Chromium. Run: node scripts/make-resources.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BRAND = "#4F46E5";

// Camera body with a small calendar page in the lens: "snap a schedule".
function glyph(size, { rounded }) {
  const r = rounded ? size * 0.22 : 0;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="${(r / size) * 1024}" fill="${BRAND}"/>
  <g fill="none" stroke="#fff" stroke-width="54" stroke-linejoin="round" stroke-linecap="round">
    <!-- camera body -->
    <path d="M200 372h118l52-78h284l52 78h118a60 60 0 0 1 60 60v300a60 60 0 0 1-60 60H200a60 60 0 0 1-60-60V432a60 60 0 0 1 60-60z"/>
    <!-- lens -->
    <circle cx="512" cy="574" r="150"/>
  </g>
  <!-- calendar page inside the lens -->
  <g>
    <rect x="442" y="512" width="140" height="124" rx="18" fill="#fff"/>
    <rect x="442" y="512" width="140" height="34" rx="18" fill="${BRAND}" opacity=".28"/>
    <rect x="462" y="562" width="24" height="24" rx="5" fill="${BRAND}"/>
    <rect x="500" y="562" width="24" height="24" rx="5" fill="${BRAND}"/>
    <rect x="538" y="562" width="24" height="24" rx="5" fill="${BRAND}"/>
    <rect x="462" y="598" width="24" height="24" rx="5" fill="${BRAND}"/>
    <rect x="500" y="598" width="24" height="24" rx="5" fill="${BRAND}" opacity=".45"/>
  </g>
  <!-- flash dot -->
  <circle cx="752" cy="452" r="26" fill="#fff"/>
</svg>`;
}

async function render(browser, svg, size, out) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(
    `<html><body style="margin:0;background:${BRAND}">${svg}</body></html>`,
  );
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log("wrote", path.relative(process.cwd(), out), `${size}x${size}`);
}

(async () => {
  const dir = path.join(__dirname, "..", "resources");
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  // App icon: full-bleed square (stores apply their own corner masks).
  await render(browser, glyph(1024, { rounded: false }), 1024, path.join(dir, "icon.png"));
  // Foreground-only icon for Android adaptive icons (transparent padding around the glyph).
  const fg = glyph(1024, { rounded: false }).replace(/<rect width="1024" height="1024"[^>]*\/>/, "");
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><div style="width:1024px;height:1024px;display:flex;align-items:center;justify-content:center"><div style="width:680px;height:680px">${fg.replace(/width="1024" height="1024"/, 'width="680" height="680"')}</div></div></body></html>`,
  );
  await page.screenshot({ path: path.join(dir, "icon-foreground.png"), omitBackground: true });
  await page.close();
  console.log("wrote resources/icon-foreground.png 1024x1024");
  // Splash: brand background with the glyph centered at ~1/3 of the canvas.
  const splashPage = await browser.newPage({ viewport: { width: 2732, height: 2732 } });
  await splashPage.setContent(
    `<html><body style="margin:0;background:${BRAND};display:flex;align-items:center;justify-content:center;width:2732px;height:2732px">
       <div style="width:900px;height:900px">${glyph(900, { rounded: true }).replace(/width="900" height="900"/, 'width="900" height="900"')}</div>
     </body></html>`,
  );
  await splashPage.screenshot({ path: path.join(dir, "splash.png") });
  await splashPage.close();
  console.log("wrote resources/splash.png 2732x2732");
  fs.writeFileSync(path.join(dir, "icon.svg"), glyph(1024, { rounded: true }));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
