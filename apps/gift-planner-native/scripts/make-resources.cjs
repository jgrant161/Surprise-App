// Renders the brand SVG to resources/icon.png (1024x1024) and resources/splash.png (2732x2732)
// using the Playwright-bundled Chromium. Run: node scripts/make-resources.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BRAND = "#db2777";

// A wrapped gift box: lid, body, vertical ribbon, and a bow. White on the rose brand color.
function glyph(size, { rounded }) {
  const r = rounded ? size * 0.22 : 0;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="${(r / size) * 1024}" fill="${BRAND}"/>
  <g fill="none" stroke="#fff" stroke-width="54" stroke-linejoin="round" stroke-linecap="round">
    <!-- lid -->
    <rect x="172" y="392" width="680" height="176" rx="28"/>
    <!-- box body -->
    <path d="M232 568v258a52 52 0 0 0 52 52h456a52 52 0 0 0 52-52V568"/>
    <!-- vertical ribbon -->
    <path d="M512 392v486"/>
    <!-- bow loops -->
    <path d="M512 392c-60-150-250-170-230-60 14 76 150 70 230 60z"/>
    <path d="M512 392c60-150 250-170 230-60-14 76-150 70-230 60z"/>
  </g>
  <!-- bow knot -->
  <circle cx="512" cy="392" r="40" fill="#fff"/>
</svg>`;
}

async function render(browser, svg, size, out) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:${BRAND}">${svg}</body></html>`);
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
       <div style="width:900px;height:900px">${glyph(900, { rounded: true })}</div>
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
