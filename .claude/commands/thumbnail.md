---
description: Add an editable on-brand Arabic text overlay to a YouTube thumbnail (16:9) and render to PNG
---

Create a YouTube thumbnail with this text/idea: **$ARGUMENTS**

Follow `CLAUDE.md` and `templates/EDITABLE.md` exactly:

1. Read `brand-kit/brand.json` + `brand-kit/design-system.md` and build in that system. If `design-system.md` is missing, run `/setup` (brand-setup) first. Read `templates/EDITABLE.md` for the editable shape.
2. Apply **`arabic-typography`** for all Arabic text (no harakat, clean RTL, mind the `الـ`+Latin trap).
3. Pick a short kebab-case `<slug>`. If I gave you a base image, put it in `public/content/thumbnails/<slug>/variants/v1/assets/` and lay text over it. Write the HTML to `public/content/thumbnails/<slug>/variants/v1/index.html` (the thumbnail = a top-level `.thumb`, 1280×720 or 1672×941).
4. **Make it editable:** the overlay text in `data-field` (+`data-label`) leaf elements; colors as `var(--…)` custom properties.
5. Write `public/content/thumbnails/<slug>/studio.json` with `title`, `description`, `render` (`.thumb` / 1280 / 720), and `editable.colors`.
6. Render:
   `node scripts/render.mjs public/content/thumbnails/<slug>/variants/v1/index.html --selector .thumb --width 1280 --height 720`
7. Tell me to refresh the Studio (I can edit the text/colors there).
