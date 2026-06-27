---
name: carousel-builder
description: Build a professional Instagram carousel (1080×1350) by starting from the proven template at templates/carousel/index.html, theming it with the user's brand, and filling it with their content. Renders to PNG. Use for any /carousel request. The composition is pre-made and professional — you theme + fill, you do NOT redesign from scratch.
---

# Carousel Builder

You build Instagram carousels that look **professional** by starting from a proven, well-composed template and adapting it — never by inventing a layout from a blank page (that produces weak, unbalanced results).

## Workflow

1. **Read the user's brand:** `brand-kit/brand.json` (colors, fonts, handle, voice, CTA) and `brand-kit/design-system.md` (their palette roles, vibe, archetype preferences). If `design-system.md` is missing → run **brand-setup** first.
2. **Copy the template** `templates/carousel/index.html` to `public/content/carousels/<slug>/variants/v1/index.html`. This is your starting structure.
3. **Theme it** — change ONLY the `:root` CSS variables and the font `<link>` to the user's brand:
   - `--bg --surface --accent --ink --muted` ← their palette (`brand.json` colors).
   - `--font-head --font-latin` + the Google Fonts link ← their fonts.
   Keep all the layout CSS exactly as-is. The composition is already balanced.
4. **Fill the content** — replace each `data-field` text with the user's real content. Set `data-field="brand"` to their brand name and `data-field="handle"` to their @handle (these repeat across slides — set once, they update everywhere).
5. **Shape the deck** — keep/duplicate/remove the `.slide--cover / --list / --stat / --cta` archetypes to fit the topic. Update the `.page` numbers. Aim for **7–10 slides**: cover hook → value slides → CTA tied to `brand.json` `cta`. Reuse the existing archetype CSS classes for any new slide — don't write new layout CSS.
6. Write `studio.json`: `{ "title", "description", "render": { "selector": ".slide", "width": 1080, "height": 1350 }, "editable": { "colors": [ {"var":"--accent","label":"المميز"}, {"var":"--bg","label":"الخلفية"}, {"var":"--ink","label":"النص"}, {"var":"--surface","label":"البطاقات"} ] } }`.
7. Render: `node scripts/render.mjs public/content/carousels/<slug>/variants/v1/index.html --selector .slide --width 1080 --height 1350`.
8. Multiple versions → `variants/v2`… with the same `data-field` ids.

## Craft rules (non-negotiable — this is what makes it look professional)
- **Fill the canvas.** Never leave a big dead zone. The template's `.main{ flex:1; justify-content:center }` does this — keep it. Content sits as a balanced mass, not crammed in a corner.
- **One dominant element per slide** — the cover title and the big stat are heroes (huge weight 900). Strong hierarchy: hero → support → footer.
- **Keep the footer bar** on every slide (handle + swipe + the divider). It's what reads as "designed," not "draft."
- **Consistent margins** (the template's 96/90px). Don't crowd the edges.
- **Contrast** — text must pop against `--bg`. If the user's bg is light, the template still works (vars cascade); just ensure `--ink` contrasts.
- **Arabic headings:** keep the template's heading line-height (≥1.4) + `padding-top` headroom — never tighten it, or the line-1 hamza on `أ`/`إ` clips at the top. (See arabic-typography.)
- Cover title ≤ 3 lines; list ≤ 4 rows; one idea per slide.

## Copy & language
- Brand voice from `brand.json`; ground it in real things; the cover must earn the swipe.
- If the content is Arabic, apply the **arabic-typography** skill and run its pre-ship checks before rendering.
- Then tell the user to open the Studio and refresh — they can edit text/colors there.
