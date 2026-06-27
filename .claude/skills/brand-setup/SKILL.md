---
name: brand-setup
description: First-run onboarding for Content OS. Interviews the user about their brand, collects their logos, then themes the professional templates to THEM — writing brand-kit/brand.json + brand-kit/design-system.md. Run before building any content (it's what makes carousels/stories look like the user's brand). Trigger on "/setup", "set up my brand", first use, or when brand-kit/design-system.md is missing.
---

# Brand Setup — make the templates theirs

Content OS ships **professional, proven templates** (`templates/carousel/`, `templates/story/`). Your job is NOT to design from scratch — it's to **interview the user and theme those templates to their brand**, so their content comes out polished *and* unmistakably theirs. Quality comes from the templates; identity comes from you.

---

## Step 1 — Interview (ask, don't assume)

Friendly and compact (batch 2–3 at a time, in the user's language). Keep it quick.

1. **Identity** — brand/creator name + main @handle? One line on what you do.
2. **Audience & language** — who's it for, what language (English / which Arabic dialect / a mix), RTL?
3. **Niche & goal** — topics, and the #1 goal (sell a course, grow a community, get clients, personal brand)?
4. **Personality** — the vibe (one or two): **bold & energetic**, **minimal & clean**, **premium & cinematic**, **playful & friendly**, **techy & futuristic**, **warm & editorial**, **luxe & elegant**.
5. **Colors** — brand colors (give hex), or should I propose a palette? Any color you love / avoid? (If they have a logo, sample its colors.)
6. **Fonts** — ALWAYS ask: "Do you have your own brand font file(s)?" 
   - If **yes** → "Drop them in `public/assets-library/fonts/` (.ttf / .otf / .woff / .woff2) and tell me the family name and which language they cover." You'll wire them via `@font-face`.
   - If **no** → name a font you like, or let me recommend a Google Font that fits the vibe + language.
   - Check what's already in `public/assets-library/fonts/` first — if files exist, ask whether to use them.
7. **Logo & assets** — "Drop your logo(s) into `public/assets-library/images/` and tell me when done." (Optional — design around a text logotype if skipped.)

If they give little, make confident choices and say they can refine in the Studio. Don't block.

---

## Step 2 — Turn the answers into a theme

Map their identity onto the template's CSS variables. Decide deliberately:

- **Palette with roles** (these map 1:1 to the template vars):
  - `background` — the canvas (dark for premium/cinematic/techy; light for minimal/editorial).
  - `surface` — cards/rows (a step off the background).
  - `accent` — ONE confident brand color (buttons, highlights, kicker).
  - `ink` — main text (must contrast strongly with background).
  - `muted` — secondary text.
  - `proof` — the color for numbers/stats in stories (often a fresh green; can equal accent).
  Ensure real contrast. Derive from their colors/logo; if none, pick a palette that fits the vibe.
- **Fonts** — a heading font + a Latin/number font. Two sources:
  - **Local font files** (the user dropped files in `public/assets-library/fonts/`) → use them. You'll declare each with an `@font-face` rule pointing at `/assets-library/fonts/<file>` and set `--font-head` to that family. Prefer this when the user has brand fonts.
  - **Google Fonts** (no local files) → recommend a real one; for Arabic prefer **Cairo / Tajawal / Baloo Bhaijaan 2 / IBM Plex Sans Arabic**. Note the exact Google Fonts `<link>` URL.
  Make sure the heading font actually supports the content language (Arabic glyphs for Arabic content).
- **Voice & CTA** — capture their tone and the action they want (keyword + line + goal).

---

## Step 3 — Write the files

**`brand-kit/brand.json`:**
```json
{
  "identity": { "name": "", "handle": "", "brandName": "", "niche": "", "language": "", "voice": "" },
  "colors": { "background": "", "surface": "", "accent": "", "ink": "", "muted": "", "proof": "" },
  "fonts": { "heading": "", "latin": "", "source": "google | local", "googleFontsUrl": "", "localFiles": [] },
  "links": { "primary": "", "instagram": "", "youtube": "" },
  "cta": { "keyword": "", "line": "", "goal": "" },
  "assets": { "logo": "/assets-library/images/<their-logo>", "avatar": "" }
}
```

**`brand-kit/design-system.md`** — their theme, concrete enough to apply without guessing:
- The palette table (each CSS var → hex → role).
- The fonts + **the exact snippet to paste into templates**:
  - Google Fonts → the `<link>` tag.
  - Local fonts → the `@font-face` block(s), e.g.
    ```css
    @font-face{ font-family:'BrandSans'; src:url('/assets-library/fonts/BrandSans.woff2') format('woff2'); font-weight:400 700; }
    ```
    and set `--font-head:'BrandSans', sans-serif;`
- The vibe in one line + the voice + CTA.
- Any archetype preferences (which carousel/story frames they'll use most).
- State clearly: *"Carousels start from `templates/carousel/`, stories from `templates/story/` — theme the `:root` vars with the palette above; never redesign the layout."*

---

## Step 4 — Prove it + hand off

1. Build **one** short sample carousel on one of their topics using **carousel-builder** (which copies `templates/carousel/` and applies this theme). Render it.
2. Tell them: "تم — هاد براندك على القوالب الاحترافية. افتح الـ Studio وحدّث، عدّل أي شي من هناك، أو اكتب `/carousel <موضوع>` أو `/story <فكرة>`."

If the content is Arabic, apply the **arabic-typography** rules.
