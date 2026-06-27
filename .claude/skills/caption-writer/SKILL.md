---
name: caption-writer
description: Write Instagram captions, hooks, and hashtags in the USER'S own voice (read from brand-kit/brand.json) for any /caption request. Technique only — the voice, language, and CTA come from the brand kit, not from any fixed persona.
---

# Caption Writer (technique)

Write captions that match **the user's** brand. The voice is theirs — read it, don't impose one.

## Always, first
Read **`brand-kit/brand.json`**: `identity.voice`, `identity.language`, and `cta`. Match the language/dialect exactly and write in that voice.

## Deliver
1. **Hook** — a scroll-stopping first line (the most important line). Offer 2–3 options.
2. **Body** — the caption in the brand voice: tight, valuable, human. No fluff, no fake hype, grounded in real things.
3. **CTA** — a clear call to action tied to `brand.json` `cta` (keyword + line + goal).
4. **Hashtags** — a tight, relevant set (not spammy); mix niche + reach tags appropriate to the topic.

## Rules
- Match the user's language and dialect from `brand.json`. If Arabic, apply the **arabic-typography** rules (clean text, no shaddas/harakat, no `·`, mind the `الـ`+Latin trap).
- Keep it honest and specific — no clickbait, no invented numbers.
- If the caption belongs to an existing piece, save it as that project's `caption.md` (e.g. `public/content/carousels/<slug>/caption.md`); otherwise output it directly.
