# Plan: Lighthouse fixes for `/#/cadastro` (RegisterPage)

## Context

The user ran Lighthouse against the running dev server on `http://localhost:5173/#/cadastro` and pasted the JSON. The report was truncated at 50k chars right after `screenshot-thumbnails`, so only Performance audits are visible — a11y / best-practices / SEO sections were cut off. The visible regression is:

| Audit | Score | Value |
|---|---|---|
| `largest-contentful-paint` | **0.63** | **2.0 s** |
| `first-contentful-paint` | 0.93 | 0.8 s ✓ |
| `speed-index` | 0.99 | 0.8 s ✓ |

Filmstrip shows the viewport stays dark for ~1.1s before content appears, consistent with the LCP being late.

## Root cause (confirmed by reading the code)

1. **`apps/web/public/banner-cadastro.png` is 1.4 MB** — it is the LCP element (covers the entire left column above the fold, `md:block`) and the page paints text only after this download starts. The login page uses `banner.png` (320 KB), which is why `/cadastro` is the worst case.
2. **`apps/web/src/components/organisms/AuthBanner/AuthBanner.ts:10–13`** — the `<img>` is created bare: no `fetchpriority`, no `decoding="async"`, no `loading="eager"`, no `width`/`height`. The browser cannot prioritize it and the missing dimensions cause CLS.
3. **`apps/web/index.html`** — no `<link rel="preload">` for the banner; `<html lang="en">` (page text is Portuguese); two render-blocking Google Fonts stylesheets, including **Material Icons** loaded for a single `arrow_forward` glyph in the submit button.
4. **A11y carry-over** from the WCAG 2 AA suite (`incomplete` items that need a real browser — Lighthouse will surface them in its Accessibility category once we capture the full report):
   - `link-in-text-block` — the accent Link in `AuthFooterPrompt` uses **color only** (`brand-green`), no underline/weight differentiation in its rest state (`apps/web/src/components/atoms/Link/Link.ts`).
   - Material Icons span on Button has no `aria-hidden="true"` — screen readers announce "arrow_forward" after the button label (`Button.ts:43–47`).

Heading contrast is fine: `text-text-primary` (#E1E1E1) on `bg-page` (#00090E) = 17:1 (WCAG AAA).

## Plan — ordered by impact

### Step 1 — Optimize the banner images (single biggest LCP win)

Replace the two PNGs with optimized WebP versions and downsize to actual rendered width.

- Target: `banner-cadastro.webp` ≤ 250 KB, `banner.webp` ≤ 200 KB, max 1200 px wide.
- Tool: any of `sharp` CLI, ImageMagick, or `cwebp`. Simpler: install `vite-plugin-image-optimizer` so future PNGs are auto-optimized at build time (this is the recommended path).
- Update references in `apps/web/src/components/pages/LoginPage/LoginPage.ts:7` and `apps/web/src/components/pages/RegisterPage/RegisterPage.ts:7`.

### Step 2 — Add critical-resource hints in `apps/web/index.html`

- Preload the LCP image: `<link rel="preload" as="image" href="/banner.png" fetchpriority="high">` (preload only the login banner since `#/login` is the default route for hash-empty URLs; the cadastro banner will benefit indirectly from the optimized size in Step 1).
- Fix `<html lang="en">` → `<html lang="pt-BR">` (a11y carry-over).
- Remove the Material Icons stylesheet entirely (handled in Step 4).

### Step 3 — Fix `<img>` attributes in `apps/web/src/components/organisms/AuthBanner/AuthBanner.ts`

Add to the image element:
- `img.fetchPriority = 'high'`
- `img.decoding = 'async'`
- `img.loading = 'eager'`
- `img.width = 720; img.height = 1024` (or whatever the actual served dimensions are after Step 1) — prevents CLS.

### Step 4 — Replace Material Icons with inline SVG

Used in exactly two places (`arrow_forward` in Button, `login` in `AuthFooterPrompt`). The whole Material Icons font is ~50–60 KB just for two glyphs.

- Create `apps/web/src/components/atoms/Icon/Icon.ts` returning an `SVGElement` with `aria-hidden="true"`.
- Inline the two glyphs as paths (Material Symbols repo / icons.getbootstrap.com / heroicons all expose them).
- Update `Button.ts:43–47` and `AuthFooterPrompt.ts` to call `Icon({ name: 'arrow_forward' })` instead of the material-icons span.
- Remove the Material Icons `<link>` from `index.html`.

### Step 5 — Make accent Link distinguishable without color (WCAG 1.4.1)

In `apps/web/src/components/atoms/Link/Link.ts`, the `accent` variant currently has color only. Add `underline underline-offset-2` (or `font-semibold`) to its **default** className — not just on hover. Keep the hover state for the additional affordance.

### Step 6 — Verify

```
pnpm --filter web build && pnpm --filter web preview
```

Then re-run Lighthouse against both `/#/login` and `/#/cadastro` (production build, not dev server — dev mode injects HMR/extra modules and skews metrics). Capture the **full** JSON this time (or the HTML report) so the truncated a11y / best-practices / SEO audits are visible.

Targets:
- LCP < 1.5 s on both pages (score ≥ 0.8)
- Accessibility category ≥ 95 (the existing axe-core suite already passes structural rules)
- The 4 existing `*.a11y.test.ts` files must still pass (`pnpm --filter web test`)
- Manual smoke test: tab through the form, confirm the submit button announces just its label (no "arrow_forward").

## Files to modify

- `apps/web/index.html`
- `apps/web/src/components/organisms/AuthBanner/AuthBanner.ts`
- `apps/web/src/components/atoms/Button/Button.ts`
- `apps/web/src/components/atoms/Link/Link.ts`
- `apps/web/src/components/molecules/AuthFooterPrompt/AuthFooterPrompt.ts`
- New: `apps/web/src/components/atoms/Icon/Icon.ts` + `Icon.test.ts`
- `apps/web/public/banner.png` → replace with optimized `banner.webp`
- `apps/web/public/banner-cadastro.png` → replace with optimized `banner-cadastro.webp`
- (Optional) `apps/web/vite.config.ts` + `apps/web/package.json` if adopting `vite-plugin-image-optimizer`

## Out of scope for this PR

- Re-running Lighthouse to capture the truncated audits is part of Step 6, but **fixing** anything beyond what's already visible (LCP + the a11y carry-over) is deferred until that report is captured. If the second Lighthouse run surfaces new findings, they get their own follow-up.
