import fs from "node:fs";
import path from "node:path";
import { extractTextFields, extractColorValue, type TextField, type ColorField } from "./edit";

export const PUBLIC = path.join(process.cwd(), "public");

export interface RenderConfig {
  selector: string;
  width: number;
  height: number;
}

interface Collection {
  type: "carousel" | "story" | "thumbnail";
  label: string;
  root: string; // relative to public/
  aspect: string;
  render: RenderConfig;
}

export const COLLECTIONS: Collection[] = [
  { type: "carousel", label: "كاروسيل", root: "content/carousels", aspect: "4 / 5", render: { selector: ".slide", width: 1080, height: 1350 } },
  { type: "story", label: "ستوري", root: "content/stories", aspect: "9 / 16", render: { selector: ".story", width: 1080, height: 1920 } },
  { type: "thumbnail", label: "ثامبنيل", root: "content/thumbnails", aspect: "16 / 9", render: { selector: ".thumb", width: 1280, height: 720 } },
];

const OUTPUT_DIR_RE = /^(png|png-.+|out|slides|export-png)$/i;
const isHidden = (n: string) => n.startsWith(".");

export interface Variant {
  id: string;
  label: string;
  slides: string[]; // web paths
  cover: string | null;
  count: number;
  mtime: number;
  editable: boolean;
  textFields: TextField[];
  colors: ColorField[];
}

export interface Project {
  id: string; // "carousel/<slug>"
  type: Collection["type"];
  typeLabel: string;
  slug: string;
  title: string;
  description?: string;
  example?: boolean;
  aspect: string;
  render: RenderConfig;
  variants: Variant[];
}

interface StudioMeta {
  title?: string;
  description?: string;
  example?: boolean;
  render?: Partial<RenderConfig>;
  editable?: { colors?: { var: string; label: string }[] };
}

const toWebPath = (abs: string) => "/" + path.relative(PUBLIC, abs).split(path.sep).join("/");

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !isHidden(d.name))
    .map((d) => d.name);
}

function pngsIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => !isHidden(f) && f.toLowerCase().endsWith(".png"))
    .map((f) => path.join(dir, f));
}

function collectSlides(variantDir: string): string[] {
  const outputDirs = fs
    .readdirSync(variantDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && OUTPUT_DIR_RE.test(d.name))
    .map((d) => d.name)
    .sort();
  const pngs = outputDirs.length
    ? outputDirs.flatMap((od) => pngsIn(path.join(variantDir, od)))
    : pngsIn(variantDir);
  return pngs.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function readMeta(projectDir: string): StudioMeta {
  const p = path.join(projectDir, "studio.json");
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      /* ignore malformed */
    }
  }
  return {};
}

function prettify(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Find the editable source HTML inside a variant dir. */
export function findHtml(variantDir: string): string | null {
  if (!fs.existsSync(variantDir)) return null;
  const index = path.join(variantDir, "index.html");
  if (fs.existsSync(index)) return index;
  const html = fs.readdirSync(variantDir).find((f) => f.toLowerCase().endsWith(".html"));
  return html ? path.join(variantDir, html) : null;
}

/** List variant {id, dir} for a project (falls back to root as implicit v1). */
function variantDirs(projectDir: string): { id: string; dir: string }[] {
  const variantsRoot = path.join(projectDir, "variants");
  const subs = listDirs(variantsRoot).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (subs.length) return subs.map((id) => ({ id, dir: path.join(variantsRoot, id) }));
  return [{ id: "v1", dir: projectDir }];
}

function buildVariant(id: string, dir: string, meta: StudioMeta): Variant | null {
  const slidesAbs = collectSlides(dir);
  if (!slidesAbs.length) return null;
  const slides = slidesAbs.map(toWebPath);
  let mtime = 0;
  try {
    mtime = fs.statSync(slidesAbs[0]).mtimeMs;
  } catch {
    /* ignore */
  }

  let textFields: TextField[] = [];
  let colors: ColorField[] = [];
  const htmlPath = findHtml(dir);
  if (htmlPath) {
    try {
      const html = fs.readFileSync(htmlPath, "utf8");
      textFields = extractTextFields(html);
      const schema = meta.editable?.colors ?? [];
      colors = schema.map((c) => ({ var: c.var, label: c.label, value: extractColorValue(html, c.var) }));
    } catch {
      /* ignore unreadable html */
    }
  }

  return {
    id,
    label: id.toUpperCase(),
    slides,
    cover: slides[0] ?? null,
    count: slides.length,
    mtime,
    editable: textFields.length > 0 || colors.length > 0,
    textFields,
    colors,
  };
}

function buildProject(col: Collection, projectDir: string, slug: string): Project | null {
  if (!fs.existsSync(projectDir)) return null;
  const meta = readMeta(projectDir);
  const variants = variantDirs(projectDir)
    .map((v) => buildVariant(v.id, v.dir, meta))
    .filter((v): v is Variant => v !== null);
  if (!variants.length) return null;

  const mtime = Math.max(...variants.map((v) => v.mtime));

  return {
    id: `${col.type}/${slug}`,
    type: col.type,
    typeLabel: col.label,
    slug,
    title: meta.title || prettify(slug),
    description: meta.description,
    example: meta.example,
    aspect: col.aspect,
    render: { ...col.render, ...meta.render },
    variants: variants.map((v) => ({ ...v, mtime })),
  };
}

export function scanProjects(): Project[] {
  const projects: Project[] = [];
  for (const col of COLLECTIONS) {
    const rootAbs = path.join(PUBLIC, col.root);
    for (const slug of listDirs(rootAbs)) {
      const p = buildProject(col, path.join(rootAbs, slug), slug);
      if (p) projects.push(p);
    }
  }
  return projects.sort((a, b) => Math.max(...b.variants.map((v) => v.mtime)) - Math.max(...a.variants.map((v) => v.mtime)));
}

/** Resolve a projectId ("carousel/<slug>") + variantId to absolute paths + render config. Validated against the content roots. */
export function resolveVariant(projectId: string, variantId: string): {
  projectDir: string;
  variantDir: string;
  htmlPath: string;
  render: RenderConfig;
} | null {
  const [type, ...rest] = projectId.split("/");
  const slug = rest.join("/");
  const col = COLLECTIONS.find((c) => c.type === type);
  if (!col || !slug || slug.includes("..")) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(variantId)) return null;

  const projectDir = path.join(PUBLIC, col.root, slug);
  if (!fs.existsSync(projectDir)) return null;

  // Resolve the variant dir, honoring the implicit-v1 fallback.
  const variantsRoot = path.join(projectDir, "variants");
  let variantDir: string;
  if (fs.existsSync(variantsRoot) && listDirs(variantsRoot).length) {
    variantDir = path.join(variantsRoot, variantId);
  } else {
    variantDir = projectDir; // implicit v1
  }
  if (!fs.existsSync(variantDir) || !variantDir.startsWith(projectDir)) return null;

  const htmlPath = findHtml(variantDir);
  if (!htmlPath) return null;

  const meta = readMeta(projectDir);
  return { projectDir, variantDir, htmlPath, render: { ...col.render, ...meta.render } };
}
