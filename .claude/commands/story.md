---
description: Build an editable, premium Instagram story sequence (1080×1920) and render to PNG
---

Build an Instagram story (or sequence) about: **$ARGUMENTS**

Follow `CLAUDE.md` and `templates/EDITABLE.md` exactly:

1. Read `brand-kit/brand.json` + `brand-kit/design-system.md` and build in that system. If `design-system.md` is missing, run `/setup` (brand-setup) first. Read `templates/EDITABLE.md` for the editable shape.
2. Use the **`story-builder`** skill (dark cinematic, highlight blocks) and **`arabic-typography`** for all Arabic text.
3. Pick a short kebab-case `<slug>`. Write the HTML to `public/content/stories/<slug>/variants/v1/index.html` (each frame = a top-level `.story`). Images → `variants/v1/assets/`.
4. **Make it editable:** editable strings in `data-field` (+`data-label`) leaf elements; brand colors as `var(--…)` custom properties.
5. Write `public/content/stories/<slug>/studio.json` with `title`, `description`, `render` (`.story` / 1080 / 1920), and `editable.colors`.
6. Run the `arabic-typography` pre-ship checks, then render:
   `node scripts/render.mjs public/content/stories/<slug>/variants/v1/index.html --selector .story --width 1080 --height 1920`
7. Remind me that interactive poll/link stickers are mockups — I add the real ones in the Instagram app. Then tell me to refresh the Studio (I can edit text/colors there).
