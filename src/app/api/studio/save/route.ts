import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { resolveVariant } from "@/lib/projects";
import { patchHtml } from "@/lib/edit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface SaveBody {
  projectId: string;
  variantId: string;
  fields?: Record<string, string>;
  colors?: Record<string, string>;
}

function clearPngs(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (f.toLowerCase().endsWith(".png")) fs.rmSync(path.join(dir, f));
  }
}

export async function POST(req: Request) {
  let body: SaveBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const resolved = resolveVariant(body.projectId ?? "", body.variantId ?? "");
  if (!resolved) {
    return NextResponse.json({ ok: false, error: "project/variant not found" }, { status: 404 });
  }
  const { variantDir, htmlPath, render } = resolved;

  // 1) Patch the source HTML (regex-only — bespoke CSS untouched).
  try {
    const html = fs.readFileSync(htmlPath, "utf8");
    const next = patchHtml(html, { fields: body.fields, colors: body.colors });
    fs.writeFileSync(htmlPath, next, "utf8");
  } catch (e) {
    return NextResponse.json({ ok: false, error: `patch failed: ${String(e)}` }, { status: 500 });
  }

  // 2) Re-render the variant to PNG at 2x.
  const pngDir = path.join(variantDir, "png");
  try {
    fs.mkdirSync(pngDir, { recursive: true });
    clearPngs(pngDir);

    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: render.width, height: render.height },
        deviceScaleFactor: 2,
      });
      await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);

      const count = await page.locator(render.selector).count();
      if (count === 0) {
        return NextResponse.json(
          { ok: false, error: `no elements matched "${render.selector}"` },
          { status: 422 },
        );
      }
      for (let i = 0; i < count; i += 1) {
        const num = String(i + 1).padStart(2, "0");
        await page.locator(render.selector).nth(i).screenshot({ path: path.join(pngDir, `slide-${num}.png`) });
      }
    } finally {
      await browser.close();
    }
  } catch (e) {
    const msg = String(e);
    const hint = /Executable doesn't exist|browserType\.launch/.test(msg)
      ? " — شغّل: pnpm exec playwright install chromium"
      : "";
    return NextResponse.json({ ok: false, error: `render failed: ${msg}${hint}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
