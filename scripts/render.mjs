#!/usr/bin/env node
/**
 * Generic HTML → PNG renderer for Content OS.
 *
 * Renders every element matching a CSS selector inside an HTML file to a PNG,
 * at 2x for crisp Instagram-ready output.
 *
 * Usage:
 *   node scripts/render.mjs <html> [--selector .slide] [--out <dir>] [--prefix slide] [--width 1080] [--height 1350]
 *
 * Examples:
 *   node scripts/render.mjs public/content/carousels/my-topic/index.html --selector .slide --out public/content/carousels/my-topic/png --width 1080 --height 1350
 *   node scripts/render.mjs public/content/stories/my-promo/index.html  --selector .story --out public/content/stories/my-promo/png  --width 1080 --height 1920
 *
 * If --out is omitted, PNGs go to <html-dir>/png.
 */
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const htmlArg = args._[0];

if (!htmlArg) {
  console.error("Usage: node scripts/render.mjs <html> [--selector .slide] [--out dir] [--prefix slide] [--width 1080] [--height 1350]");
  process.exit(1);
}

const htmlPath = path.resolve(htmlArg);
if (!existsSync(htmlPath)) {
  console.error(`✗ HTML not found: ${htmlPath}`);
  process.exit(1);
}

const selector = args.selector || ".slide";
const prefix = args.prefix || "slide";
const outDir = path.resolve(args.out || path.join(path.dirname(htmlPath), "png"));
const width = Number(args.width || 1080);
const height = Number(args.height || 1350);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(900);

const count = await page.locator(selector).count();
if (count === 0) {
  console.error(`✗ No elements matched selector "${selector}" in ${htmlPath}`);
  await browser.close();
  process.exit(1);
}

for (let i = 0; i < count; i += 1) {
  const num = String(i + 1).padStart(2, "0");
  const file = path.join(outDir, `${prefix}-${num}.png`);
  await page.locator(selector).nth(i).screenshot({ path: file });
  console.log(`✓ ${path.relative(process.cwd(), file)}`);
}

await browser.close();
console.log(`\nRendered ${count} → ${path.relative(process.cwd(), outDir)}`);
