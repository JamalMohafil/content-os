/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import {
  Images,
  Clapperboard,
  Image as ImageIcon,
  Library,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  Music,
  Type,
  Film,
  FolderOpen,
  Terminal,
  Pencil,
  Plus,
  Loader2,
  Layers,
  Eye,
} from "lucide-react";

/* ----------------------------- types ----------------------------- */

interface TextField {
  id: string;
  label: string;
  value: string;
}
interface ColorField {
  var: string;
  label: string;
  value: string;
}
interface Variant {
  id: string;
  label: string;
  slides: string[];
  cover: string | null;
  count: number;
  mtime: number;
  editable: boolean;
  textFields: TextField[];
  colors: ColorField[];
}
interface Project {
  id: string;
  type: "carousel" | "story" | "thumbnail";
  typeLabel: string;
  slug: string;
  title: string;
  description?: string;
  example?: boolean;
  aspect: string;
  variants: Variant[];
}
interface Asset {
  name: string;
  path: string;
  kind: "image" | "audio" | "video" | "font";
  ext: string;
  size: number;
  mtime: number;
  folder: string;
}
type Tab = "carousel" | "story" | "thumbnail" | "assets";

/* --------------------------- helpers --------------------------- */

const bust = (src: string, b: number) => `${src}${src.includes("?") ? "&" : "?"}b=${b}`;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadVariantZip(project: Project, variant: Variant) {
  const zip = new JSZip();
  const folder = zip.folder(`${project.slug}-${variant.id}`) ?? zip;
  await Promise.all(
    variant.slides.map(async (src, i) => {
      const res = await fetch(src);
      const buf = await res.arrayBuffer();
      const name = src.split("/").pop() || `slide-${String(i + 1).padStart(2, "0")}.png`;
      folder.file(name, buf);
    }),
  );
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${project.slug}-${variant.id}.zip`);
}

function fmtSize(bytes: number) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

const TABS: { key: Tab; label: string; icon: typeof Images }[] = [
  { key: "carousel", label: "الكاروسيلز", icon: Images },
  { key: "story", label: "الستوريز", icon: Clapperboard },
  { key: "thumbnail", label: "الثامبنيلز", icon: ImageIcon },
  { key: "assets", label: "المكتبة", icon: Library },
];

/* ============================== page ============================== */

export default function StudioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tab, setTab] = useState<Tab>("carousel");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [b, setB] = useState(1);

  const load = useCallback(async () => {
    const [lib, ast] = await Promise.all([
      fetch("/api/studio/library").then((r) => r.json()),
      fetch("/api/studio/assets").then((r) => r.json()),
    ]);
    setProjects(lib.projects ?? []);
    setAssets(ast.assets ?? []);
    setB((x) => x + 1);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { carousel: 0, story: 0, thumbnail: 0, assets: assets.length };
    for (const p of projects) c[p.type] = (c[p.type] || 0) + 1;
    return c;
  }, [projects, assets]);

  const visible = projects.filter((p) => p.type === tab);
  const active = activeId ? projects.find((p) => p.id === activeId) ?? null : null;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-[var(--purple-100)] bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)] to-[var(--purple-700)] text-white shadow-lg shadow-[var(--purple-200)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-[var(--purple-900)]">Content OS</h1>
              <p className="text-xs text-[var(--gray-500)]">استوديو المحتوى — شوف، حسّن، نزّل</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-[var(--purple-200)] bg-white px-4 py-2 text-sm font-semibold text-[var(--purple-700)] transition hover:bg-[var(--purple-50)]"
          >
            <Terminal size={16} />
            كيف أصنع محتوى؟
          </button>
        </div>

        {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
          {TABS.map(({ key, label, icon: Icon }) => {
            const on = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  on
                    ? "bg-[var(--purple-600)] text-white shadow-md shadow-[var(--purple-200)]"
                    : "text-[var(--gray-500)] hover:bg-[var(--purple-50)] hover:text-[var(--purple-700)]"
                }`}
              >
                <Icon size={16} />
                {label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${on ? "bg-white/20" : "bg-[var(--purple-100)] text-[var(--purple-600)]"}`}>
                  {counts[key] ?? 0}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {loading ? (
          <SkeletonGrid />
        ) : tab === "assets" ? (
          <AssetLibrary assets={assets} b={b} />
        ) : visible.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProjectCard key={p.id} project={p} b={b} onOpen={() => setActiveId(p.id)} />
            ))}
          </div>
        )}
      </main>

      {active && <ProjectModal project={active} b={b} onChanged={load} onClose={() => setActiveId(null)} />}
    </div>
  );
}

/* --------------------------- help panel --------------------------- */

function HelpPanel({ onClose }: { onClose: () => void }) {
  const steps = [
    "افتح Claude Code جوّا مجلد المشروع (content-os)",
    "اكتب أمر من تحت — انسخ المثال وبدّل الموضوع بفكرتك",
    "ارجع لهون واضغط تحديث (F5) — بيطلعلك المحتوى جاهز تشوفه وتنزّله",
  ];
  const cmds: { cmd: string; desc: string; ex: string; tag?: string }[] = [
    { cmd: "/setup", desc: "يسألك عن براندك ويجهّز ستايلك الخاص", ex: "/setup", tag: "أول مرة ابدأ من هون" },
    { cmd: "/carousel", desc: "كاروسيل انستغرام (1080×1350)", ex: "/carousel 3 أدوات AI وفرت عليي ساعات" },
    { cmd: "/story", desc: "ستوري بريميوم (1080×1920)", ex: "/story رحلتي ببناء أول تطبيق" },
    { cmd: "/thumbnail", desc: "ثامبنيل يوتيوب (16:9)", ex: "/thumbnail بنيت تطبيق بساعة" },
    { cmd: "/caption", desc: "كابشن + هاشتاغات لموضوع أو لمشروع عملته", ex: "/caption كاروسيل GEO" },
    { cmd: "/repurpose", desc: "ياخد محتوى عملته ويحوّله لريل ولينكدإن وثريد", ex: "/repurpose كاروسيل GEO" },
  ];
  return (
    <div className="border-t border-[var(--purple-100)] bg-[var(--purple-50)]">
      <div className="mx-auto max-w-6xl px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[var(--purple-900)]">كيف تستخدم Content OS؟</h3>
          <button onClick={onClose} className="text-[var(--gray-400)] hover:text-[var(--gray-500)]">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[var(--purple-100)] bg-white px-3 py-2.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--purple-600)] text-xs font-bold text-white">{i + 1}</span>
              <span className="text-xs leading-relaxed text-[var(--gray-600)]">{s}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 text-xs font-bold text-[var(--purple-900)]">الأوامر — اكتبها داخل Claude Code:</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {cmds.map((c) => (
            <div key={c.cmd} className="rounded-xl border border-[var(--purple-100)] bg-white px-3 py-2.5">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <code dir="ltr" className="rounded-lg bg-[var(--purple-900)] px-2.5 py-1 font-mono text-xs font-bold text-white">{c.cmd}</code>
                <span className="text-xs font-semibold text-[var(--purple-900)]">{c.desc}</span>
                {c.tag && <span className="rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--purple-600)]">{c.tag}</span>}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[var(--purple-50)] px-2.5 py-1.5">
                <span className="shrink-0 text-[10px] font-bold text-[var(--purple-400)]">مثال</span>
                <code dir="ltr" className="font-mono text-[11px] text-[var(--gray-600)]">{c.ex}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- project card --------------------------- */

function ProjectCard({ project, b, onOpen }: { project: Project; b: number; onOpen: () => void }) {
  const v0 = project.variants[0];
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--purple-100)] bg-white text-right shadow-sm transition hover:-translate-y-1 hover:border-[var(--purple-300)] hover:shadow-xl hover:shadow-[var(--purple-100)]"
    >
      <div className="relative overflow-hidden bg-[var(--gray-100)]" style={{ aspectRatio: project.aspect }}>
        {v0?.cover ? (
          <img src={bust(v0.cover, b)} alt={project.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--gray-400)]">
            <FolderOpen size={28} />
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {v0?.count ?? 0} {project.type === "thumbnail" ? "صورة" : "سلايد"}
        </span>
        <div className="absolute left-2 top-2 flex gap-1.5">
          {project.example && <span className="rounded-full bg-[var(--purple-600)]/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">مثال</span>}
          {project.variants.length > 1 && (
            <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <Layers size={11} /> {project.variants.length}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-bold text-[var(--purple-900)]">{project.title}</h3>
        <p className="text-xs text-[var(--gray-400)]">{project.typeLabel}</p>
      </div>
    </button>
  );
}

/* --------------------------- project modal --------------------------- */

function ProjectModal({ project, b, onChanged, onClose }: { project: Project; b: number; onChanged: () => Promise<void>; onClose: () => void }) {
  const [variantId, setVariantId] = useState(project.variants[0]?.id ?? "v1");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // lock the page scroll behind the modal
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // keep the selected variant valid as the project refreshes
  useEffect(() => {
    if (!project.variants.some((v) => v.id === variantId)) setVariantId(project.variants[0]?.id ?? "v1");
  }, [project, variantId]);

  const variant = project.variants.find((v) => v.id === variantId) ?? project.variants[0];

  const handleZip = async () => {
    setZipping(true);
    try {
      await downloadVariantZip(project, variant);
    } finally {
      setZipping(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const res = await fetch("/api/studio/variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, action: "duplicate", from: variantId }),
      }).then((r) => r.json());
      await onChanged();
      if (res.variantId) setVariantId(res.variantId);
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-6 w-full max-w-4xl rounded-3xl bg-[var(--background)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--purple-100)] p-5">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="truncate text-xl font-bold text-[var(--purple-900)]">{project.title}</h2>
              {project.example && <span className="rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--purple-600)]">مثال</span>}
            </div>
            <p className="text-sm text-[var(--gray-500)]">
              {project.typeLabel} · {variant?.count ?? 0} {project.type === "thumbnail" ? "صورة" : "سلايد"}
              {project.description ? ` · ${project.description}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[var(--gray-400)] hover:bg-[var(--purple-50)] hover:text-[var(--gray-500)]">
            <X size={20} />
          </button>
        </div>

        {/* variant bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--purple-100)] px-5 py-3">
          <span className="text-xs font-semibold text-[var(--gray-400)]">النسخ:</span>
          {project.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => { setVariantId(v.id); setMode("view"); }}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                v.id === variantId ? "bg-[var(--purple-600)] text-white" : "bg-white text-[var(--gray-500)] hover:bg-[var(--purple-50)]"
              }`}
            >
              {v.label}
            </button>
          ))}
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="flex items-center gap-1 rounded-full border border-dashed border-[var(--purple-300)] px-3 py-1 text-xs font-semibold text-[var(--purple-600)] hover:bg-[var(--purple-50)] disabled:opacity-50"
          >
            {duplicating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} نسخة جديدة
          </button>

          <div className="ms-auto flex items-center gap-2">
            {variant?.editable && (
              <button
                onClick={() => setMode((m) => (m === "edit" ? "view" : "edit"))}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  mode === "edit" ? "bg-[var(--purple-100)] text-[var(--purple-700)]" : "bg-white text-[var(--purple-700)] hover:bg-[var(--purple-50)]"
                }`}
              >
                {mode === "edit" ? <Eye size={15} /> : <Pencil size={15} />}
                {mode === "edit" ? "معاينة" : "تعديل"}
              </button>
            )}
            <button
              onClick={handleZip}
              disabled={zipping}
              className="flex items-center gap-2 rounded-full bg-[var(--purple-600)] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[var(--purple-700)] disabled:opacity-60"
            >
              {zipping ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {zipping ? "…" : "تحميل ZIP"}
            </button>
          </div>
        </div>

        {/* body */}
        {mode === "edit" && variant?.editable ? (
          <EditPanel
            project={project}
            variant={variant}
            b={b}
            onDone={async () => { await onChanged(); setMode("view"); }}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
              {variant?.slides.map((src, i) => (
                <div key={src} className="group relative overflow-hidden rounded-xl border border-[var(--purple-100)] bg-white">
                  <img
                    src={bust(src, b)}
                    alt={`${project.title} ${i + 1}`}
                    className="w-full cursor-zoom-in object-cover"
                    style={{ aspectRatio: project.aspect }}
                    loading="lazy"
                    onClick={() => setLightbox(i)}
                  />
                  <a
                    href={src}
                    download
                    className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={12} /> تحميل
                  </a>
                  <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">{i + 1}</span>
                </div>
              ))}
            </div>

            <ImprovePanel project={project} variant={variant} />
          </>
        )}
      </div>

      {lightbox !== null && variant && (
        <Lightbox slides={variant.slides.map((s) => bust(s, b))} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

/* --------------------------- edit panel --------------------------- */

function EditPanel({ project, variant, b, onDone }: { project: Project; variant: Variant; b: number; onDone: () => Promise<void>; }) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFields(Object.fromEntries(variant.textFields.map((f) => [f.id, f.value])));
    setColors(Object.fromEntries(variant.colors.map((c) => [c.var, c.value])));
    setError(null);
  }, [variant.id, variant.textFields, variant.colors]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, variantId: variant.id, fields, colors }),
      }).then((r) => r.json());
      if (!res.ok) {
        setError(res.error || "فشل الحفظ");
        return;
      }
      await onDone();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 p-5 md:grid-cols-[1fr_320px]">
      {/* fields */}
      <div className="space-y-4">
        {variant.colors.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-[var(--purple-900)]">الألوان</h3>
            <div className="flex flex-wrap gap-3">
              {variant.colors.map((c) => (
                <div key={c.var} className="flex items-center gap-2 rounded-xl border border-[var(--purple-100)] bg-white px-3 py-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(colors[c.var] ?? "") ? colors[c.var] : "#7C3AED"}
                    onChange={(e) => setColors((p) => ({ ...p, [c.var]: e.target.value }))}
                    className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[var(--purple-900)]">{c.label}</p>
                    <input
                      dir="ltr"
                      value={colors[c.var] ?? ""}
                      onChange={(e) => setColors((p) => ({ ...p, [c.var]: e.target.value }))}
                      className="w-24 rounded font-mono text-[11px] text-[var(--gray-500)] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {variant.textFields.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-[var(--purple-900)]">النصوص</h3>
            <div className="space-y-3">
              {variant.textFields.map((f) => (
                <label key={f.id} className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--gray-500)]">{f.label}</span>
                  <textarea
                    value={fields[f.id] ?? ""}
                    onChange={(e) => setFields((p) => ({ ...p, [f.id]: e.target.value }))}
                    rows={(fields[f.id] ?? "").length > 40 ? 2 : 1}
                    className="w-full resize-none rounded-xl border border-[var(--purple-200)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--purple-400)]"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[var(--purple-600)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--purple-700)] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "جاري الحفظ وإعادة الرندر…" : "احفظ وأعد الرندر"}
          </button>
          <span className="text-xs text-[var(--gray-400)]">يعيد توليد صور النسخة بالـ Playwright</span>
        </div>
      </div>

      {/* live cover preview */}
      <div className="hidden md:block">
        <p className="mb-2 text-xs font-semibold text-[var(--gray-400)]">المعاينة الحالية</p>
        {variant.cover && (
          <img src={bust(variant.cover, b)} alt="preview" className="w-full rounded-xl border border-[var(--purple-100)]" style={{ aspectRatio: project.aspect }} />
        )}
        <p className="mt-2 text-[11px] text-[var(--gray-400)]">تتحدّث بعد الحفظ.</p>
      </div>
    </div>
  );
}

/* --------------------------- improve panel --------------------------- */

function ImprovePanel({ project, variant }: { project: Project; variant: Variant }) {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const folder = `content/${project.type === "story" ? "stories" : project.type === "thumbnail" ? "thumbnails" : "carousels"}/${project.slug}`;
  const variantPath = project.variants.length > 1 ? `${folder}/variants/${variant.id}` : folder;
  const prompt = `حسّن ${project.typeLabel} «${project.title}» (النسخة ${variant.label}) الموجود في ${variantPath}/ ثم أعد التصدير. التعديلات المطلوبة: ${note.trim() || "(اكتب هون وش تبي تعدّل)"}`;

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="border-t border-[var(--purple-100)] p-5">
      <div className="rounded-2xl border border-[var(--purple-200)] bg-[var(--purple-50)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--purple-600)]" />
          <h3 className="text-sm font-bold text-[var(--purple-900)]">تعديل أعمق عبر Claude Code</h3>
        </div>
        <p className="mb-3 text-xs text-[var(--gray-500)]">
          للتغييرات الكبيرة (تخطيط، صور، سلايد جديد): اكتب وش تبي، انسخ الأمر، والصقه داخل Claude Code. بعد ما يخلّص حدّث الصفحة.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="مثال: ضيف سلايد رابع عن الأسعار، وغيّر صورة السلايد الأول…"
          rows={2}
          className="mb-3 w-full resize-none rounded-xl border border-[var(--purple-200)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--purple-400)]"
        />
        <div className="flex items-center justify-end">
          <button onClick={copy} className="flex items-center gap-2 rounded-full bg-[var(--purple-900)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--purple-800)]">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "تم النسخ" : "انسخ أمر التحسين"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- lightbox --------------------------- */

function Lightbox({ slides, index, onIndex, onClose }: { slides: string[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const prev = useCallback(() => onIndex((index - 1 + slides.length) % slides.length), [index, slides.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % slides.length), [index, slides.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  if (typeof document === "undefined") return null;

  const node = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6" onClick={onClose}>
      <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={onClose}>
        <X size={22} />
      </button>
      <button className="absolute left-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); next(); }}>
        <ChevronLeft size={26} />
      </button>
      <img src={slides[index]} alt={`slide ${index + 1}`} className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
      <button className="absolute right-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prev(); }}>
        <ChevronRight size={26} />
      </button>
      <div className="absolute bottom-6 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">{index + 1} / {slides.length}</span>
        <a href={slides[index]} download className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[var(--purple-900)]">
          <Download size={15} /> تحميل
        </a>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

/* --------------------------- assets library --------------------------- */

const ASSET_KINDS: { key: Asset["kind"] | "all"; label: string; icon: typeof Music }[] = [
  { key: "all", label: "الكل", icon: Library },
  { key: "image", label: "صور", icon: ImageIcon },
  { key: "audio", label: "موسيقى وصوت", icon: Music },
  { key: "video", label: "فيديو", icon: Film },
  { key: "font", label: "خطوط", icon: Type },
];

function AssetLibrary({ assets, b }: { assets: Asset[]; b: number }) {
  const [kind, setKind] = useState<Asset["kind"] | "all">("all");
  const list = kind === "all" ? assets : assets.filter((a) => a.kind === kind);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {ASSET_KINDS.map(({ key, label, icon: Icon }) => {
          const on = kind === key;
          const n = key === "all" ? assets.length : assets.filter((a) => a.kind === key).length;
          return (
            <button
              key={key}
              onClick={() => setKind(key)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                on ? "bg-[var(--purple-600)] text-white" : "bg-white text-[var(--gray-500)] hover:bg-[var(--purple-50)]"
              }`}
            >
              <Icon size={15} />
              {label}
              <span className={`text-xs ${on ? "text-white/70" : "text-[var(--gray-400)]"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--purple-200)] bg-white p-10 text-center">
          <Library size={32} className="mx-auto mb-3 text-[var(--purple-300)]" />
          <p className="font-semibold text-[var(--purple-900)]">المكتبة فاضية</p>
          <p className="mt-1 text-sm text-[var(--gray-500)]">
            حط ملفاتك في <code dir="ltr" className="rounded bg-[var(--purple-50)] px-1.5 py-0.5 font-mono text-xs">public/assets-library/</code> (images / video / music / audio) وحدّث الصفحة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((a) => (
            <AssetCard key={a.path} asset={a} b={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset, b }: { asset: Asset; b: number }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--purple-100)] bg-white shadow-sm">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-[var(--gray-50)]">
        {asset.kind === "image" ? (
          <img src={bust(asset.path, b)} alt={asset.name} className="h-full w-full object-contain p-2" loading="lazy" />
        ) : asset.kind === "audio" ? (
          <Music size={34} className="text-[var(--purple-300)]" />
        ) : asset.kind === "video" ? (
          <video src={asset.path} controls playsInline className="h-full w-full bg-black object-contain" />
        ) : (
          <Type size={34} className="text-[var(--purple-300)]" />
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <p className="truncate text-xs font-semibold text-[var(--purple-900)]" title={asset.name}>{asset.name}</p>
        {asset.kind === "audio" && <audio src={asset.path} controls className="w-full" style={{ height: 32 }} />}
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase text-[var(--gray-400)]">{asset.ext}{asset.size ? ` · ${fmtSize(asset.size)}` : ""}</span>
          <a href={asset.path} download className="flex items-center gap-1 rounded-full bg-[var(--purple-50)] px-2.5 py-1 text-[11px] font-semibold text-[var(--purple-700)] hover:bg-[var(--purple-100)]">
            <Download size={12} /> تحميل
          </a>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- empty + skeleton --------------------------- */

function EmptyState({ tab }: { tab: Tab }) {
  const copy: Record<string, { title: string; cmd: string }> = {
    carousel: { title: "ما في كاروسيلز بعد", cmd: "/carousel موضوعك" },
    story: { title: "ما في ستوريز بعد", cmd: "/story فكرتك" },
    thumbnail: { title: "ما في ثامبنيلز بعد", cmd: "/thumbnail نصك" },
  };
  const c = copy[tab] ?? copy.carousel;
  return (
    <div className="rounded-2xl border border-dashed border-[var(--purple-200)] bg-white p-12 text-center">
      <Sparkles size={34} className="mx-auto mb-3 text-[var(--purple-300)]" />
      <p className="text-lg font-bold text-[var(--purple-900)]">{c.title}</p>
      <p className="mt-2 text-sm text-[var(--gray-500)]">
        افتح Claude Code بهالمجلد واكتب{" "}
        <code dir="ltr" className="rounded-lg bg-[var(--purple-900)] px-2 py-1 font-mono text-xs text-white">{c.cmd}</code>
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[var(--purple-100)] bg-white">
          <div className="aspect-[4/5] animate-pulse bg-[var(--purple-50)]" />
          <div className="space-y-2 p-3">
            <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-[var(--purple-50)]" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-[var(--purple-50)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
