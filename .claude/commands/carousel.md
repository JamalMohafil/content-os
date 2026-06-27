---
description: Build an editable, on-brand Instagram carousel (1080×1350) and render to PNG
---

Build an Instagram carousel about: **$ARGUMENTS**

Follow `CLAUDE.md` and `templates/EDITABLE.md` exactly:

1. Read `brand-kit/brand.json` + `brand-kit/design-system.md` and build in that system. If `design-system.md` is missing, run `/setup` (brand-setup) first. Read `templates/EDITABLE.md` for the editable shape.
2. Use the **`carousel-builder`** skill for the design and **`arabic-typography`** for all Arabic text.
3. Pick a short kebab-case `<slug>`. Write the HTML to `public/content/carousels/<slug>/variants/v1/index.html` (each slide = a top-level `.slide`). Images → `variants/v1/assets/`.
4. **Make it editable:** every editable string in a `data-field` (+`data-label`) leaf element; every brand color as a `var(--…)` CSS custom property.
5. Write `public/content/carousels/<slug>/studio.json` with `title`, `description`, `render` (`.slide` / 1080 / 1350), and `editable.colors`.
6. Run the `arabic-typography` pre-ship checks, then render:
   `node scripts/render.mjs public/content/carousels/<slug>/variants/v1/index.html --selector .slide --width 1080 --height 1350`
7. If I asked for multiple versions, repeat as `variants/v2`, `v3`… (same `data-field` ids). Then tell me to open the Studio and refresh — I can edit text/colors there.
