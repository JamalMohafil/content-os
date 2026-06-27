import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { COLLECTIONS, PUBLIC } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VariantBody {
  projectId: string;
  action: "duplicate" | "delete";
  from?: string;
  variantId?: string;
}

function resolveProjectDir(projectId: string): string | null {
  const [type, ...rest] = (projectId ?? "").split("/");
  const slug = rest.join("/");
  const col = COLLECTIONS.find((c) => c.type === type);
  if (!col || !slug || slug.includes("..")) return null;
  const dir = path.join(PUBLIC, col.root, slug);
  return fs.existsSync(dir) ? dir : null;
}

const listVariantIds = (variantsRoot: string): string[] =>
  fs.existsSync(variantsRoot)
    ? fs
        .readdirSync(variantsRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .map((d) => d.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : [];

const nextId = (ids: string[]): string => {
  const nums = ids.map((id) => Number(id.replace(/^v/i, "")) || 0);
  return `v${Math.max(0, ...nums) + 1}`;
};

/** Move a legacy single-variant project (files at root) into variants/v1. */
function ensureVariants(projectDir: string): string {
  const variantsRoot = path.join(projectDir, "variants");
  if (listVariantIds(variantsRoot).length) return variantsRoot;

  const v1 = path.join(variantsRoot, "v1");
  fs.mkdirSync(v1, { recursive: true });
  for (const entry of fs.readdirSync(projectDir)) {
    if (entry === "studio.json" || entry === "variants" || entry.startsWith(".")) continue;
    fs.renameSync(path.join(projectDir, entry), path.join(v1, entry));
  }
  return variantsRoot;
}

export async function POST(req: Request) {
  let body: VariantBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const projectDir = resolveProjectDir(body.projectId);
  if (!projectDir) return NextResponse.json({ ok: false, error: "project not found" }, { status: 404 });

  if (body.action === "duplicate") {
    const variantsRoot = ensureVariants(projectDir);
    const ids = listVariantIds(variantsRoot);
    const fromId = body.from && ids.includes(body.from) ? body.from : ids[ids.length - 1];
    const fromDir = path.join(variantsRoot, fromId);
    const newIdValue = nextId(ids);
    const newDir = path.join(variantsRoot, newIdValue);
    try {
      fs.cpSync(fromDir, newDir, { recursive: true });
    } catch (e) {
      return NextResponse.json({ ok: false, error: `copy failed: ${String(e)}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, variantId: newIdValue });
  }

  if (body.action === "delete") {
    const variantsRoot = path.join(projectDir, "variants");
    const ids = listVariantIds(variantsRoot);
    if (ids.length <= 1) {
      return NextResponse.json({ ok: false, error: "can't delete the only variant" }, { status: 409 });
    }
    if (!body.variantId || !ids.includes(body.variantId)) {
      return NextResponse.json({ ok: false, error: "variant not found" }, { status: 404 });
    }
    fs.rmSync(path.join(variantsRoot, body.variantId), { recursive: true, force: true });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
}
