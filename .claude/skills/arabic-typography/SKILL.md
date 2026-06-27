---
name: arabic-typography
description: Correctly typeset Arabic (Levantine/Gulf) text in the brand's heading font for a creator's carousels and visual assets. Covers the letter-spacing trap, line-height for diacritics, mixed Arabic+Latin (bidi), number/punctuation direction, and line breaks. Use whenever writing or styling Arabic display text in HTML/CSS — especially when text "looks crushed", "غير واضح", letters overlap, words run together, or diacritics get clipped.
---

# Arabic Typography — Baloo Bhaijaan 2

Rules for making Arabic display text render **clean and legible** in your brand assets. These are battle-learned fixes for bugs that kept recurring. Apply them by default; don't wait to be told.

## The font

- **Baloo Bhaijaan 2** (Google Fonts), weights 400/500/600/700/800. Used for ALL Arabic + general body/headings.
- **Space Grotesk** — Latin numbers/labels ONLY (page counters, mega numbers, stat figures like `1M`, `$8`, `VS`).
- Arabic is **cursive and connected** — letters join. It has **diacritics** (shadda ّ, fatha, etc.) that sit *above/below* the baseline. Both facts drive every rule below.

---

## Rule 1 — NEVER negative `letter-spacing` on Arabic (the #1 recurring bug)

Negative tracking overlaps the letter joins in connected script and crushes words into an unreadable blur. This is the single most common mistake.

```css
/* ❌ WRONG — crushes "تختار" / "استخدمتهم" into a blur */
.cover-h { letter-spacing: -1.5px; }   /* element contains Arabic */

/* ✅ RIGHT */
.cover-h { letter-spacing: normal; }   /* or 0 */
```

- Arabic (or mixed Arabic+Latin) element → `letter-spacing: normal`. Full stop.
- Negative tracking (`-1px` … `-4px`) is allowed **only** on pure-Latin/numeric Space Grotesk elements: mega numbers, `1M`, `$8`, `VS`, page counter.
- If a heading mixes Arabic with a Latin word (e.g. `بـ 2026؟`, `Brand كامل`) → still `normal`. Never negative.
- Positive letter-spacing on Arabic is also wrong (it *breaks* the joins). The only place positive tracking is OK is an all-caps Latin label (`letter-spacing: 2px; text-transform: uppercase`).

## Rule 2 — Line-height must clear the diacritics

Arabic at display size needs vertical room or the hamza/dots/ascenders collide with — or get clipped at — the line above.

| Context | Min line-height | Safe default |
|---|---|---|
| Huge display headline ≥ 100px, weight 900 | 1.4 | **1.42** |
| Display headline 80–100px, weight 800 | 1.35 | 1.4 |
| Mid headline 50–80px | 1.3 | 1.35 |
| Body / lead / captions | 1.4 | 1.45 |
| Short 1–2 word label in a card | 1.25 | 1.3 |

**The line-1 hamza/diacritic clip (recurring bug):** on the FIRST line of a big heading, the hamza on `أ` / `إ` (and the dots on `ث` `ن` `ق`) sit *above* the normal cap line — at a tight line-height they get **clipped flat at the top**. Two fixes, apply BOTH on any heading ≥ 100px:
1. line-height ≥ **1.4** (never 1.3 on huge headings — that's what clips).
2. add top headroom on the heading element: `padding-top:.1em` (carousel `.title`) / `.08em` (story `.h1/.h2`).

If unsure, go looser. Clipped hamza/diacritics are an instant "looks broken" tell.

## Rule 3 — Direction & bidi for mixed text

The page root is already RTL (`<html dir="rtl">`). Do **not** hardcode `dir` on children — direction inherits. (See global RTL guidance.) But:

- Wrap embedded **Latin words/numbers** inside Arabic in a `.ltr` span so the bidi algorithm doesn't reorder them oddly:
  ```css
  .ltr { display:inline-block; direction:ltr; font-family:inherit; }
  ```
  ```html
  حدّد أول <span class="ltr">MVP</span> قبل ما تبدأ
  ```
- Numbers, `$`, `%`, `/`, `+` next to Latin → keep them inside an `.ltr`/Latin context (`$8`, `400K`, `87.6%`, `2026`). Standalone in an Arabic sentence they usually behave, but if a `?`/`،` floats to the wrong side, the cause is a straddling Latin token — wrap it.
- Don't let an Arabic sentence straddle an embedded Latin word mid-clause if it causes punctuation to jump; rewrite the sentence instead.
- **The `الـ` / `بالـ` + Latin-word trap (recurring bug):** never put the definite-article prefix `الـ` (or `بالـ`, `للـ`) immediately before a `.ltr`-isolated Latin word — e.g. `أعمق بالـ <span class="ltr">terminal</span>` or `عبر الـ <span class="ltr">CLI</span>`. The detached article letters jump to the wrong side and the Latin word floats off. Fix by **dropping the article** before the Latin word: `عبر <span class="ltr">CLI</span>`, `بفتح <span class="ltr">Agents</span>` — or rephrase so the Latin word follows a clean Arabic word (not a one-letter connector). Verb/preposition + Latin (e.g. `يفتح Agents`, `تفتح agents`) renders fine.
- **The `direction:ltr` parent leak (root cause of "the words are reversed"):** layout containers that place cards/columns left-to-right are often set `direction:ltr` (e.g. a 2-up `.battle`/grid where Codex sits left, Claude right). That LTR **base direction inherits into the Arabic text inside**, so an Arabic phrase containing a Latin word reverses order — `Marketplace مدمج` renders as `مدمج Marketplace`. **Fix:** keep `direction:ltr` on the layout wrapper for card order, but explicitly set `direction:rtl` on every Arabic **text** block inside it (verdict lines, captions, list items). Rule of thumb: LTR is only ever for *layout/flex order*; any element whose text is Arabic must be `direction:rtl`. If you see reversed words, check the nearest ancestor for `direction:ltr` before touching the markup.

## Rule 4 — Punctuation

- Prefer the Arabic question mark `؟` and comma `،` in Arabic sentences (not `?` / `,`).
- **Avoid the em-dash `—`** anywhere in visible slide text (headlines, subs, leads, callouts) — reads machine-generated. Use an Arabic comma `،`, a line break, or rewrite. (HTML comments / `<title>` are fine.)
- **NEVER use the middot `·` as a separator between words**. Not in headlines (`4 أوامر · فرق كبير` ❌), not in lists, not in CTAs. Rewrite into a phrase (`4 أوامر بتعمل فرق كبير`), use a line break, or an Arabic comma `،`. Applies to tech lists too — write `Claude Code و Codex` or stack them, never `Claude Code · Codex`.
- Don't end a punchy headline with `.`.
- **NEVER put shaddas or any harakat/diacritics (ّ َ ِ ُ ْ …) on letters**. Write Arabic bare, the way people type on social (`نفذ` not `نفّذ`, `مميز` not `مميّز`, `شغال` not `شغّال`, `جربهم` not `جرّبهم`). The shadda glyph also collides with the line above in big display weights. Before export, strip the shadda codepoint: `perl -CSD -i -pe 's/\x{0651}//g' <file>.html` (and check for stray harakat).

## Rule 5 — Line breaks read top-to-bottom as one sentence

When splitting a headline across lines with `<br/>`, each line must continue the previous one naturally — no logical cut. Build a flowing sentence:

```html
<!-- ✅ reads as one connected thought -->
<h2>استخدمهم للفكرة</h2>      <!-- section label -->
<h2>لتوضيح المشكلة</h2>        <!-- continues -->
<h2>وتحديد الـ <span class="ltr">MVP</span></h2>
```

Avoid stacking two unrelated fragments. If lines don't connect, rewrite.

## Rule 6 — Weight & size for legibility on Instagram

- Display headlines: weight **800**. Sub-headlines: **700**. Body: **600** (500 only for low-emphasis).
- Minimum readable size on a phone feed: body/caption text **≥ 40px** at 1080px canvas width. Anything ~30px and below disappears on mobile. Bump small captions/tags up.

---

## Pre-ship checklist (run before exporting)

1. **Grep for the trap:** no negative `letter-spacing` on any Arabic-containing selector.
   ```bash
   grep -nE "letter-spacing:\s*-" <file>.html
   ```
   Every hit must be a pure-Latin/numeric Space Grotesk element. If it wraps Arabic → change to `normal`.
2. Every Arabic headline > 80px has line-height ≥ 1.3.
3. Embedded Latin words/numbers are wrapped in `.ltr`.
4. No `—` (em-dash) and no `·` (middot) anywhere in visible text; no trailing `.` in headlines.
   ```bash
   grep -n "—\|·" <file>.html | grep -v "<!--"
   ```
5. No shaddas/harakat on letters — must return nothing:
   ```bash
   perl -CSD -ne 'print "$.\n" if /[\x{064B}-\x{0652}]/' <file>.html
   ```
6. No `الـ`/`بالـ`/`للـ` immediately before a Latin word: `grep -noE "(الـ|بالـ|للـ) [A-Za-z<]" <file>.html`
7. Embedded Latin words/numbers wrapped in `.ltr`; no body/caption text below ~40px.
8. Big headings (≥100px) have line-height ≥ 1.4 **and** top headroom (`padding-top:.08–.1em`) so the line-1 hamza isn't clipped.
9. **Render and look.** Export to PNG and actually view slide 1, the closing, and any text-dense slide. Check: letters not crushed, no diacritics on letters, punctuation on the correct side, lines connect, and the **top of أ/إ and the dots on line 1 are not cut**.

## How to verify (render + vision)

```bash
node scripts/render.mjs public/content/carousels/<slug>/variants/v1/index.html --selector .slide --width 1080 --height 1350
```
Then Read the PNGs and inspect the Arabic. Crushed letters = negative tracking left in. Clipped dots = line-height too tight.
