---
name: story-builder
description: Build a premium Instagram story/sequence (1080×1920) by starting from the proven template at templates/story/index.html, theming it with the user's brand, and filling it with their content. Renders to PNG. Use for any /story request. The cinematic composition is pre-made — you theme + fill, you do NOT redesign from scratch.
---

# Story Builder

You build premium, cinematic Instagram stories by starting from a proven template and adapting it — never from a blank page.

## Workflow

1. **Read the user's brand:** `brand-kit/brand.json` + `brand-kit/design-system.md`. If `design-system.md` is missing → run **brand-setup** first.
2. **Copy the template** `templates/story/index.html` → `public/content/stories/<slug>/variants/v1/index.html`.
3. **Theme it** — change ONLY the `:root` CSS variables + font links to the user's brand:
   - `--bg --accent --ink --muted --proof` (proof = the color for numbers/stats) and `--font-head --font-latin`.
   Keep all the layout CSS (glow, grid, vignette, highlight blocks, safe zones) exactly as-is.
4. **Fill content** — replace each `data-field`. Set `brand` + `handle` (they repeat). If the user has an avatar image, swap the `.dot` span for `<img src="/assets-library/images/<file>" class="dot">`.
5. **Shape the sequence** — keep/duplicate/remove `.story--hook / --point / --proof / --cta`. Update the counters (`01 / 04`). A good arc: hook → point(s) → proof → CTA tied to `brand.json` `cta`. Reuse the existing classes; don't write new layout CSS.
6. Write `studio.json`: `{ "title", "description", "render": { "selector": ".story", "width": 1080, "height": 1920 }, "editable": { "colors": [ {"var":"--accent","label":"المميز"}, {"var":"--bg","label":"الخلفية"}, {"var":"--proof","label":"لون الأرقام"} ] } }`.
7. Render: `node scripts/render.mjs public/content/stories/<slug>/variants/v1/index.html --selector .story --width 1080 --height 1920`.

## Craft rules (non-negotiable)
- **Safe zones:** keep key content out of the top ~240px / bottom ~220px (Instagram UI). The template's padding handles this — don't reduce it.
- **The signature move:** put the 1–2 power words in a highlight block (`.hb-w` white / `.hb-a` accent). The `.hb` already has the descender padding (46px bottom) so Arabic tails don't clip — keep it.
- **Color discipline:** white = base text, accent = emphasis blocks, `--proof` = numbers/stats ONLY. One accent idea per frame. Don't rainbow it.
- **Glanceable:** big type, one message per frame, high contrast.
- **Arabic headings:** keep the template's heading line-height (≥1.4) + `padding-top` headroom — never tighten it, or the line-1 hamza on `أ`/`إ` clips at the top. (See arabic-typography.)
- **Interactive stickers (poll/link) are mockups** in the PNG — always remind the user to add the real Instagram sticker in-app.

## Copy & language
- Brand voice from `brand.json`; ground it in real things; the hook frame must stop the scroll.
- If Arabic, apply **arabic-typography** + its pre-ship checks before rendering.
- Then tell the user to refresh the Studio (and to add real poll/link stickers in-app).
