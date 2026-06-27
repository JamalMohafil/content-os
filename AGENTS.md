# Content OS — Agent Instructions

> For Codex / Cursor / any coding agent. Claude Code reads `CLAUDE.md` (identical guidance). **Read `CLAUDE.md` for the full brief.**

## What this is
Turn a topic into on-brand social content (Instagram carousels, stories, YouTube thumbnails, captions) as HTML, render to PNG. The user views/downloads from the local **Studio** (`pnpm dev` → http://localhost:3000). You write content into `public/content/`; you never edit the Studio UI under `src/`.

## First run
If `brand-kit/design-system.md` is missing, the user hasn't onboarded — run the **brand-setup** skill (or `/setup`) first. It interviews them and **generates their own** `brand.json` + `design-system.md`. There is no built-in house style; every look is generated per user. Never reuse another creator's design.

## Every request
1. **Read `brand-kit/brand.json` + `brand-kit/design-system.md` first** — build strictly in *their* system (palette, fonts, layout, voice, CTA). Never hardcode or borrow another brand. Read `templates/EDITABLE.md` for the editable shape.
2. Use the matching skill in `.claude/skills/`: `carousel-builder`, `story-builder`, `caption-writer`, and **always** `arabic-typography` for Arabic text.
3. Write HTML → `public/content/<type>/<slug>/variants/v1/index.html` (`<type>` = carousels | stories | thumbnails). Input images → `variants/v1/assets/`. Multiple versions → `variants/v2`, `v3`…
4. **Make it editable (required):** every editable string in a `data-field="id"` (+`data-label`) leaf element; every brand color as a `var(--…)` CSS custom property. The Studio edits these and re-renders.
5. Render the variant (output lands in its `png/`):
   - carousel: `node scripts/render.mjs <html> --selector .slide --width 1080 --height 1350`
   - story: `node scripts/render.mjs <html> --selector .story --width 1080 --height 1920`
   - thumbnail: `node scripts/render.mjs <html> --selector .thumb --width 1280 --height 720`
6. Add `public/content/<type>/<slug>/studio.json` = `{ "title", "description", "render": {selector,width,height}, "editable": { "colors": [{var,label}] } }`.
7. Tell the user to refresh the Studio — they can edit text/colors there.

## Hard rules
- Clean Arabic only (see `arabic-typography`): no shaddas/harakat, no `·`, no `—` in body, mind the `الـ`+Latin trap, RTL, highlight-block descender padding. Run its pre-ship checks before rendering.
- Brand from `brand-kit/brand.json`. Ground content in real things. No clickbait.

## Improving content
A request like "حسّن … في content/carousels/<slug>/" → edit that `index.html` in place, re-render, confirm.
