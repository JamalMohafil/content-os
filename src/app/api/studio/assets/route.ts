import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC = path.join(process.cwd(), "public");

// Asset roots scanned for the library, relative to public/.
const ASSET_ROOTS = ["assets-library"];

const KIND_BY_EXT: Record<string, "image" | "audio" | "video" | "font"> = {
  png: "image", jpg: "image", jpeg: "image", svg: "image", webp: "image", gif: "image",
  mp3: "audio", wav: "audio", m4a: "audio", aac: "audio", ogg: "audio",
  mp4: "video", mov: "video", webm: "video",
  ttf: "font", otf: "font", woff: "font", woff2: "font",
};

interface Asset {
  name: string;
  path: string; // web path
  kind: "image" | "audio" | "video" | "font";
  ext: string;
  size: number;
  mtime: number;
  folder: string; // sub-folder under the root (e.g. images / music)
}

const isHidden = (name: string) => name.startsWith(".");
const toWebPath = (abs: string) => "/" + path.relative(PUBLIC, abs).split(path.sep).join("/");

function walk(dir: string, rootAbs: string, out: Asset[]) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isHidden(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, rootAbs, out);
      continue;
    }
    const ext = path.extname(entry.name).slice(1).toLowerCase();
    const kind = KIND_BY_EXT[ext];
    if (!kind) continue;
    let size = 0;
    let mtime = 0;
    try {
      const st = fs.statSync(abs);
      size = st.size;
      mtime = st.mtimeMs;
    } catch {
      /* ignore */
    }
    const rel = path.relative(rootAbs, abs).split(path.sep);
    const folder = rel.length > 1 ? rel[0] : "";
    out.push({ name: entry.name, path: toWebPath(abs), kind, ext, size, mtime, folder });
  }
}

export function GET() {
  const assets: Asset[] = [];
  for (const root of ASSET_ROOTS) {
    const rootAbs = path.join(PUBLIC, root);
    walk(rootAbs, rootAbs, assets);
  }
  assets.sort((a, b) => b.mtime - a.mtime);

  const counts = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.kind] = (acc[a.kind] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ assets, counts });
}
