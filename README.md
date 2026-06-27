# Content OS 🎨

**Turn any idea into on-brand social content — carousels, stories, thumbnails, and captions — using AI, then view, refine, and download it all from one clean Studio.**

You talk to an AI agent (Claude Code) in plain language. It designs the content in *your* brand, renders it to ready-to-post images, and drops them into the **Studio** — a local web app where you preview every slide, tweak it, and download it.

No design tools. No code. Just your ideas.

---

## What's inside

| Format | What you get | Size |
|---|---|---|
| 🟣 **Carousels** | Multi-slide Instagram carousels | 1080×1350 |
| 🎬 **Stories** | Premium cinematic story sequences | 1080×1920 |
| 🖼️ **Thumbnails** | YouTube thumbnails with bold text | 16:9 |
| ✍️ **Captions** | Hooks, captions, and hashtags | — |
| 🔄 **Repurpose** | One idea → Reel, LinkedIn, X thread | — |
| 📚 **Library** | Your reusable images, video, music & audio | — |

---

## Quick start (≈10 minutes)

**1. Install the basics** (one time)
- [Node.js](https://nodejs.org) (LTS) and [pnpm](https://pnpm.io/installation) (`npm i -g pnpm`)
- [Claude Code](https://claude.com/claude-code) — `npm i -g @anthropic-ai/claude-code`

**2. Get the project**
```bash
git clone <your-repo-url> content-os
cd content-os
pnpm install
```

**3. Build YOUR brand** — in a terminal in this folder, run `claude`, then type:
```
/setup
```
It interviews you (your name, niche, audience, vibe, colors, fonts), asks you to drop your **logo(s)** into `public/assets-library/images/`, and then **generates your own** brand kit + design system (`brand-kit/brand.json` + `brand-kit/design-system.md`). There's no pre-made house style — the look is generated from *your* answers and is 100% yours.

**4. Start the Studio**
```bash
pnpm dev
```
Open **http://localhost:3000**.

**5. Create your first piece** — in Claude Code, type:
```
/carousel <your topic>
```
The agent builds it in *your* system. Go back to the Studio and **refresh** — your carousel is there, editable and ready to download.

---

## How you'll use it day to day

```
   YOU type a command in Claude Code  ─►  AGENT designs + renders it  ─►  STUDIO shows it
                  ▲                                                            │
                  └──────────────  "تحسين" → copy prompt → paste back  ◄───────┘
```

**Create** (in Claude Code):
| Command | Does |
|---|---|
| `/setup` | Onboarding — generates *your* brand kit + design system (run once) |
| `/carousel <topic>` | Instagram carousel, in your system |
| `/story <idea>` | Story sequence, in your system |
| `/thumbnail <text>` | YouTube thumbnail |
| `/caption <topic or piece>` | Caption + hashtags in your voice |
| `/repurpose <project>` | Adapt to other platforms |

**Edit (right in the Studio)** — open any piece and hit **تعديل**: change the **text** and the **brand colors** there, then **احفظ وأعد الرندر** — it re-renders to PNG instantly (Playwright), keeping the design pixel-perfect.

**Variants (نسخ)** — keep multiple versions of a piece (different hooks, color themes). Duplicate a version with **نسخة جديدة** and tweak each independently, or ask the agent for "3 variants".

**Refine deeper** — for bigger changes (layout, a new slide, swapping an image), use the **تحسين** prompt → paste it into Claude Code, which edits and re-renders in place.

**Download** — per-slide, or the whole variant as a **ZIP**.

**Assets** — drop images/music into `public/assets-library/{images,video,music,audio}/`; they appear under the **Library** tab.

---

## Folder structure

```
content-os/
├── brand-kit/
│   ├── brand.example.json      ← the shape; `/setup` generates your real brand.json
│   ├── brand.json              ← YOUR brand (generated, git-ignored, local only)
│   └── design-system.md        ← YOUR design system (generated, git-ignored, local only)
├── CLAUDE.md / AGENTS.md       ← instructions the AI agent follows
├── .claude/
│   ├── commands/               ← /setup, /carousel, /story… slash commands
│   └── skills/                 ← brand-setup (onboarding) + generic builders + arabic-typography
├── scripts/render.mjs          ← HTML → PNG renderer (the agent runs this)
├── public/
│   ├── content/                ← everything the agent makes (git-ignored, local only)
│   │   ├── carousels/  stories/  thumbnails/
│   │   └── <slug>/  ( variants/v1/index.html · png/ · assets/ · studio.json )
│   └── assets-library/         ← your images, video, music, audio (git-ignored, local only)
└── src/                        ← the Studio web app (you don't touch this)
```

> **Your stuff stays yours.** `brand.json`, `design-system.md`, everything under `public/content/`, and your `assets-library/` are **git-ignored** — they live only on your machine and are never pushed. The published repo ships *no* house style and *no* content; each person runs `/setup` to generate their own.

---

## FAQ

**Do I need to know how to code?** No. You type ideas in plain language; the agent writes and renders everything.

**Where do the images come from?** The agent builds each design as HTML and screenshots it at 2× with Playwright (`scripts/render.mjs`). Run `pnpm exec playwright install chromium` once if rendering complains about a missing browser.

**Can I change the design system?** Yes — your look lives in `brand-kit/design-system.md`. Run `/setup` again to regenerate it, or edit that file directly; every new piece follows it. The builder skills are pure technique and carry no fixed style.

**Is my content private?** Yes. Your brand, design system, content, and assets are all git-ignored — they live only on your machine and are never pushed. Nothing is uploaded.

---

Your brand. Your design. Your machine. 🚀
