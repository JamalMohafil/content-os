# Editable HTML — annotated reference

Author every piece so the Studio can edit **text** and **colors** in-browser. Two rules:

1. **Text** → wrap each editable string in a leaf element with `data-field="id"` (and a friendly `data-label`). Text only inside (a `<br>` is OK).
2. **Colors** → declare every brand color as a CSS custom property (`--accent`, `--bg`, …), use it via `var(--…)`, and list the editable ones in `studio.json`.

Then the Studio shows a text box per `data-field` and a color picker per listed var, and re-renders on save — without ever touching your CSS.

---

## Minimal carousel slide (copy this shape)

`public/content/carousels/<slug>/variants/v1/index.html`:

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *{ margin:0; padding:0; box-sizing:border-box; }

    /* ▼ editable colors — every brand color is a var, listed in studio.json */
    :root{
      --bg:#0F0A1E;
      --accent:#7C3AED;
      --ink:#FFFFFF;
    }

    body{ font-family:'Cairo',sans-serif; }
    .slide{
      width:1080px; height:1350px; padding:120px 90px;
      display:flex; flex-direction:column; justify-content:center; gap:40px;
      background:var(--bg); color:var(--ink); direction:rtl; text-align:right;
    }
    .kicker{ display:inline-block; align-self:flex-start;
      background:var(--accent); color:#fff; font-weight:800; font-size:40px;
      padding:14px 28px; border-radius:16px; }
    .title{ font-size:104px; font-weight:900; line-height:1.3; }
    .body{ font-size:52px; font-weight:600; line-height:1.5; opacity:.85; }
  </style>
</head>
<body>
  <!-- each top-level .slide = one rendered PNG -->
  <section class="slide">
    <span class="kicker" data-field="kicker" data-label="الشريط العلوي">درس اليوم</span>
    <h1 class="title" data-field="s1_title" data-label="عنوان السلايد 1">ابنِ تطبيقك بـ Claude Code</h1>
    <p class="body" data-field="s1_body" data-label="نص السلايد 1">من فكرة لتطبيق شغّال بساعة، بدون ما تكتب كود.</p>
  </section>

  <section class="slide">
    <span class="kicker" data-field="kicker" data-label="الشريط العلوي">الخطوة 1</span>
    <h1 class="title" data-field="s2_title" data-label="عنوان السلايد 2">وصّف فكرتك بالعربي</h1>
    <p class="body" data-field="s2_body" data-label="نص السلايد 2">احكي شو بدك بالضبط، وخلي الـ AI يبني.</p>
  </section>
</body>
</html>
```

> Note: `data-field="kicker"` repeats on both slides → editing it once updates both. Use unique ids (`s1_title`, `s2_title`) when slides should differ.

`public/content/carousels/<slug>/studio.json`:

```json
{
  "title": "ابنِ تطبيقك بـ Claude Code",
  "description": "كاروسيل تعليمي قابل للتعديل",
  "render": { "selector": ".slide", "width": 1080, "height": 1350 },
  "editable": {
    "colors": [
      { "var": "--accent", "label": "اللون المميز" },
      { "var": "--bg", "label": "الخلفية" },
      { "var": "--ink", "label": "لون النص" }
    ]
  }
}
```

Render:
```bash
node scripts/render.mjs public/content/carousels/<slug>/variants/v1/index.html --selector .slide --width 1080 --height 1350
```

---

## Stories & thumbnails

Same idea, different top-level element + size:
- **Story** — each frame is a `.story` (1080×1920). `--selector .story --width 1080 --height 1920`. See the full premium design system in the `story-builder` skill.
- **Thumbnail** — the canvas is a `.thumb` (1280×720 or 1672×941). `--selector .thumb --width 1280 --height 720`.

## Color rules
- Only list colors in `studio.json` that you actually drive through `var(--…)`. A color the user picks but that isn't used anywhere does nothing.
- Keep values as 6-digit hex (`#7C3AED`) so the picker works. For translucent layers, build them from the hex in CSS (e.g. a separate `--glow` var) rather than `rgba()` the user can't pick.
