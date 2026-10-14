# KnowPsyche — project guide for Claude Code

KnowPsyche (knowpsyche.com) is a free psychology test site. Wave 1 ships 7 tests on 21 Oct 2026.
Every score is calculated in the browser. Nothing is stored, sent or sold.

## Stack

- Astro (static output, multi-page). No React, no Vue, no SPA routing.
- Tailwind CSS v4 (via `@tailwindcss/vite`). Design tokens live in `src/styles/global.css` under `@theme`.
- Interactivity = plain TypeScript in Astro `<script>` tags. Keep JS per page small.
- Fonts self-hosted with `@fontsource` packages (Space Grotesk, Instrument Serif, DM Mono). No Google Fonts requests.
- `@astrojs/sitemap` for the sitemap. Vitest for scoring logic tests.
- Hosting: Cloudflare Pages (static). Deploy with `npm run deploy`.
- Use the Astro docs MCP (`astro-docs`) whenever you are unsure how Astro does something.

## Commands

- `npm run dev` — local dev server (localhost:4321)
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the build (sitemap and 404 only work here)
- `npm run test` — Vitest scoring tests
- `npm run deploy` — build + deploy to Cloudflare Pages (added in the deploy step)

## Sources of truth — read before building anything

- `docs/content/part-1.md` — Reaction Time + Enneagram: all page copy, questions, scoring, bands, FAQs, sources.
- `docs/content/part-2.md` — Photographic Memory, Number Memory, Attention Span, Stroop, Emotional Intelligence + the **Shared rules** section.
- `docs/design/*.dc.html` — the approved designs (Main = homepage, Test, Result, Article, About, Method, Privacy, Contact). Reference only, never ship these files.
- `docs/design/preview/` — a packed export of the full design canvas. Open it in a browser to compare visually; don't parse it.
- `DESIGN.md` — tokens, type, components, motion. Follow it exactly.

Reference files in `docs/reference/` — read only when the task needs them:
- SEO work → `06_ai_seo_geo_aeo_training.md`
- Writing any new page copy (Terms, 404, meta descriptions) → `07_humanwriting_guide.md`
- AdSense readiness / audit (only when Dev asks) → `00_ADSENSE_INDEX.md` to `05_ADSENSE_AUDIT_PROMPT.md`
- Research notes (background only, never copy text, never override the content docs): docs/research/cognitive-background.md and docs/research/myths.md. Read only when the task needs them.

Copy text from the content docs word for word. Do not rewrite, shorten or "improve" copy. If something is missing or contradicts, stop and ask.

## Hard product rules (never break)

1. No clinical tests, no diagnosis language. Never say "MBTI", "IQ score", "brain age", "diagnosis" as something we give.
2. No percentiles, "top X%", "better than X% of people". We have no population data.
3. Every result shows the line: "These bands are our own guide to help you read your result. They're not compared with a population, and they're not a diagnosis."
4. Test data is never sent anywhere: no network call ever carries answers, scores or saved results. It is stored only in the user's own browser (localStorage, key `knowpsyche_saved_results`, via `src/lib/saved-results.ts`) and only after an explicit opt-in (the "Save result" button, off by default, never automatic). Stored fields are exactly: test id, ISO day, band badge, headline, and the data the result already shows (Enneagram nine type scores, EQ four area scores, every other test its main number), plus an optional name. Never answers, never per-try timings. Every storage call sits in try/catch; if storage is blocked, the opt-in is not shown. Retaking a test overwrites its entry. A "Clear saved results" control must always be available while anything is saved. No sessionStorage, cookies or IndexedDB for test data.
5. No email gate, no sign-up, no "unlock your result".
6. No ads inside a running test or between questions. Ad slots only: below the intro, below the result, inside the FAQ area. Build `AdSlot.astro` that renders nothing until `PUBLIC_ADS_ENABLED=true`.
7. Plain English. No brain-region names or neurotransmitters on test/result pages.
8. Kind framing: low scores = "still developing" / "room to grow", never failure.
9. No dark patterns: no fake timers, fake counters, fake reviews, fake ratings in schema.

## Test engine rules

- Each test = `src/pages/<slug>/index.astro` + logic in `src/lib/tests/<slug>.ts` (pure functions: scoring, bands) + content in `src/data/tests/<slug>.ts`.
- Scoring functions are pure and covered by Vitest tests (edge cases: all same answers, zero correct, max level, ties).
- Timing: use `performance.now()`. Schedule stimuli with `requestAnimationFrame`, not chained `setTimeout` drift.
- Reaction time: under 100 ms = "too early/guess", excluded and the try repeated.
- Every test: keyboard support (Space/Enter or keys 1–5 as specified), visible Restart, 44px tap targets, "tap" wording on touch devices.
- `prefers-reduced-motion`: no decorative animation, instant swaps; test timing unchanged.
- Result pattern (same for all 7): headline → score visual → what it means → one "Try this" tip → bands disclaimer → Share card + Try again → Next test + Learn link → FAQ → Sources.
- Share card: generated client-side on `<canvas>` → Web Share API, fallback download PNG. Shows only the headline result + knowpsyche.com.
- Line near every Start button: "Private by design: your answers never leave this page."

## URLs (trailing slash)

`/` · `/tests/` · `/reaction-time-test/` · `/enneagram-test/` · `/photographic-memory-test/` · `/number-memory-test/` · `/attention-span-test/` · `/stroop-test/` · `/emotional-intelligence-test/` · `/about/` · `/method/` · `/privacy/` · `/terms/` · `/contact/` · `404`

Set `trailingSlash: 'always'` and `site: 'https://knowpsyche.com'` in `astro.config.mjs`.

## SEO rules

- One `<h1>` per page. Title + meta description exactly as in the content docs.
- `BaseLayout` takes title, description, canonical, ogImage. Canonical always `https://knowpsyche.com/...`.
- Open Graph + Twitter card tags on every page.
- JSON-LD: `WebSite` + `Organization` on home; `BreadcrumbList` on all inner pages; `FAQPage` on every page that shows FAQs (same questions as visible on the page). No `aggregateRating`, no reviews.
- `public/_headers`: `X-Robots-Tag: noindex` for `https://:project.pages.dev/*` so the preview domain never gets indexed.
- `robots.txt` allows all and points to `/sitemap-index.xml`.

## Performance + accessibility targets

- Lighthouse mobile ≥ 95 in all four categories. No layout shift on test screens.
- Colour contrast AA. Focus ring: 2px solid `--color-blue`, offset 3px.
- Images: SVG where possible; otherwise Astro `<Image>` with width/height.

## How to work

- Big tasks: plan first, list files you will touch, then build.
- Before saying "done": `npm run build` passes with zero errors and warnings you introduced, `npm run test` passes, and you checked the page at 360px, 768px and 1280px widths.
- After each finished task: `git add -A && git commit -m "<what changed>"`. Small, clear commits.
- Do not add a dependency without saying why. Do not add analytics, AdSense or any third-party script unless asked.
- Do not touch `docs/`, `CLAUDE.md` or `DESIGN.md` unless asked.
