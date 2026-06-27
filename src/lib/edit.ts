/**
 * Fidelity-safe HTML editing for Content OS.
 *
 * We patch hand-authored HTML with plain regex (no DOM re-serialization) so the
 * agent's bespoke CSS — gradients, masks, box-decoration-break — is never touched.
 *
 * Conventions the agent follows:
 *   - Editable text lives on a LEAF element marked `data-field="id"` (optional
 *     `data-label="عنوان"`). The element contains text only (no nested tags
 *     except <br>). Same id on multiple slides → edited together.
 *   - Editable colors are CSS custom properties (e.g. `--accent: #7C3AED;`)
 *     declared once in a <style> block and listed in studio.json `editable.colors`.
 */

export interface TextField {
  id: string;
  label: string;
  value: string;
}

export interface ColorField {
  var: string; // e.g. "--accent"
  label: string;
  value: string; // current hex, read live from the HTML
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Strip tags → plain text for the editor input (keeps <br> as newlines). */
function innerToText(inner: string): string {
  return inner
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Discover every `data-field` element (deduped by id for the editor UI). */
export function extractTextFields(html: string): TextField[] {
  const re = /<([a-zA-Z][\w-]*)\b([^>]*?)\bdata-field=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/\1>/g;
  const seen = new Set<string>();
  const fields: TextField[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const id = m[3];
    if (seen.has(id)) continue;
    seen.add(id);
    const attrs = `${m[2]} ${m[4]}`;
    const labelMatch = /\bdata-label=["']([^"']+)["']/.exec(attrs);
    fields.push({ id, label: labelMatch ? labelMatch[1] : id, value: innerToText(m[5]) });
  }
  return fields;
}

/** Read the current value of a CSS custom property from the HTML. */
export function extractColorValue(html: string, varName: string): string {
  const name = varName.replace(/^--/, "");
  const re = new RegExp(`--${escapeRegex(name)}\\s*:\\s*([^;]+);`);
  const m = re.exec(html);
  return m ? m[1].trim() : "";
}

/** Replace every `data-field="id"` element's inner text. */
export function patchTextFields(html: string, fields: Record<string, string>): string {
  let out = html;
  for (const [id, value] of Object.entries(fields)) {
    const safe = escapeHtml(value).replace(/\n/g, "<br/>");
    const re = new RegExp(
      `(<([a-zA-Z][\\w-]*)\\b[^>]*?\\bdata-field=["']${escapeRegex(id)}["'][^>]*>)([\\s\\S]*?)(<\\/\\2>)`,
      "g",
    );
    out = out.replace(re, (_full, open: string, _tag: string, _inner: string, close: string) => open + safe + close);
  }
  return out;
}

/** Replace CSS custom-property values (e.g. { "--accent": "#22C55E" }). */
export function patchColors(html: string, colors: Record<string, string>): string {
  let out = html;
  for (const [rawVar, value] of Object.entries(colors)) {
    const name = rawVar.replace(/^--/, "");
    const re = new RegExp(`(--${escapeRegex(name)}\\s*:\\s*)([^;]+)(;)`, "g");
    out = out.replace(re, (_full, a: string, _b: string, c: string) => a + value + c);
  }
  return out;
}

export function patchHtml(
  html: string,
  edits: { fields?: Record<string, string>; colors?: Record<string, string> },
): string {
  let out = html;
  if (edits.fields) out = patchTextFields(out, edits.fields);
  if (edits.colors) out = patchColors(out, edits.colors);
  return out;
}
