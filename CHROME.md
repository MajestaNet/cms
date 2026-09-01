# Chrome plan — Majesta One docs (`one.majesta.net`)

Review of the generated Starlight site (`sites/one`, fixture pin). This is the implementation plan for the three defects operators hit today: **invisible menus**, **clunky/broken search**, **uneven edges**. It is not a second brand. Tokens stay [BRAND.md](./BRAND.md). Overlay rules stay [QUALITY.md](./QUALITY.md).

**Do not ship this as a `cms-update` overlay PR.** It is chrome: CSS, header components, fonts, and Netlify CSP. Pin stays `unset`.

## What is wrong (from the generated site)

The header already follows the QUALITY.md shell (navy bar, gold lockup ≥180px, “One”, search and GitHub on the right). The rest of Starlight still speaks **dark-theme token names** with **light-theme layout**, and the Pagefind CSP is too strict for search to run on Netlify.

| Surface | What you see | Cause |
|---|---|---|
| Desktop sidebar | Current page is a navy pill. Other top-level items (Install, Connect, CLI, API, …) are ivory on ivory — gone. Nested API links are navy and readable. | `--sl-color-white` was set to ivory. Starlight paints `.large` labels with that token. |
| Page H1 | Title is missing on ivory. Body copy is fine. | `PageTitle` and markdown headings use `--sl-color-white`. Pagination titles were already patched with `!important` navy — same bug, one-off fix. |
| Mobile menu | Top-level items are ivory on the navy overlay (readable). Nested API links are navy on navy. Hamburger is a navy circle on the navy bar. | Mobile pane uses `--sl-color-black` (also navy). Menu button uses light-theme “black/white” which we inverted. |
| Fonts | Josefin is loaded but almost unused. Headings stay Inter (Starlight never reads `--sl-font-headings`). Sidebar `.large` asks for weight 600; Inter is only 400/500. | `astro.config.mjs` + unused CSS variable. |
| Search (right) | Trigger is in the right place. Modal is a large empty ivory card with a navy pill input, then heavy navy result blocks. In `make dev` the modal is a stub. On Netlify, Pagefind WASM/worker is blocked by CSP — UI opens, query does nothing. | Starlight Pagefind defaults + `script-src 'self'` without `'wasm-unsafe-eval'` / `worker-src 'self' blob:`. |
| Edges | Header and banner are square. Search, pagination, current-page pill, and the menu button are 0.25–0.5rem or a circle. Hairlines mix gold (header), `#d4cfc4`, and unset `--sl-color-hairline-shade`. Banner sits as a floating block in the content column. | Webpage identity is sharp rectangles and one navy-12% hairline. Starlight leftovers were never normalized. |

Root mistake: `sites/one/src/styles/custom.css` mapped `--sl-color-white` → ivory and `--sl-color-black` → navy so header icons would show on the navy bar. In Starlight **light** theme, `white` means strongest **text** and `black` means the **page fill**. Flipping them globally makes every heading/menu that uses `white` disappear on ivory. Header chrome must stay a **local** ivory/gold override, not a global invert.

## Target (same identity as majesta.net)

| Token | Value | Docs use |
|---|---|---|
| Navy | `#1B2E46` | Header, current-page fill, search field text, headings |
| Gold | `#F6CF55` | Lockup, product noun, focus ring, header hairline, hover |
| Ivory | `#F5F1E8` | Page, sidebar, modal fill |
| Slate | `#697685` | Secondary / meta |
| Hairline | `color-mix(in srgb, var(--mn-navy) 12%, transparent)` | Every divider and card edge |
| Radius | `0` | No pills, no circular menu, no 8px pagination |
| Display | Josefin Sans 300/400 | H1–H3, “One”, sidebar group labels, section labels |
| Text | Inter 400/500 | Body, nested nav, search UI, tables |

Header stays navy. Content stays ivory. No theme toggle. Gold is never body text on ivory.

### Starlight light-theme mapping (the actual fix)

| Starlight token | Meaning | Set to |
|---|---|---|
| `--sl-color-white` | Strongest text | navy |
| `--sl-color-black` | Page / card surface | ivory |
| `--sl-color-gray-2` | Default link / sidebar item | navy |
| `--sl-color-text` | Body | navy |
| `--sl-color-text-invert` | Text on accent fill | ivory |
| `--sl-color-text-accent` | Current-page fill | navy |
| `--sl-color-bg` / `--sl-color-bg-sidebar` | Page | ivory |
| `--sl-color-bg-nav` | Header (exception) | navy |
| `--sl-color-hairline` / `-light` / `-shade` | Dividers | navy 12% hairline |

Then keep the **header-only** rules already in `custom.css` (search button and GitHub ivory/gold on navy). Do not restyle the header per page.

## Work in three cuts

Each cut is its own PR if needed. Cut 1 is the contrast bug; it should land first.

### Cut 1 — Color and type (menus and titles visible)

**Files:** `sites/one/src/styles/custom.css`, `sites/one/astro.config.mjs`, `sites/one/src/components/Head.astro`, `QUALITY.md` (token rule).

1. Remap tokens as the table above. Also set `--sl-color-hairline-light` and `--sl-color-hairline-shade` (today they leak Starlight defaults).
2. Apply Josefin: `h1, h2, h3, .large, .mn-product { font-family: var(--sl-font-headings); font-weight: 400; }`. Starlight 0.41 does not use `--sl-font-headings`.
3. Load Inter at 400 and 500 only. Cap UI weights at 500 so nothing faux-bolds.
4. Sidebar: default navy on ivory; current page ivory on navy, square; hover gold hairline or navy, never ivory-on-ivory.
5. Mobile menu button: ivory or gold icon on the navy bar, square, no 50% circle, no navy-on-navy fill. Nested mobile links must be ivory when the pane is navy — or keep the pane ivory like desktop.
6. Force `data-theme="light"` before Starlight’s theme script (HTML is emitted `dark`). Custom tokens already apply to both, but unset tokens still follow dark if the inline script is blocked.
7. Drop the pagination `!important` navy once `--sl-color-white` is navy.

**Done when:** every sidebar item is readable on desktop; H1 is navy Josefin; current page is the only filled item; mobile nested API links are readable; `make docs-check` and `make build` stay green.

### Cut 2 — Search that works, and looks like this site

Keep search on the **right**. Change the control and the modal, and unblock Pagefind on Netlify.

**Files:** `sites/one/src/styles/custom.css`, `sites/one/src/components/Header.astro`, `sites/one/netlify.toml`, `sites/_template/netlify.toml`, `NETLIFY.md`, `packages/cms-core/tests/netlify.test.ts`.

1. CSP (production is why search “doesn’t work”): add `'wasm-unsafe-eval'` to `script-src` and `worker-src 'self' blob:`. Do not add `'unsafe-eval'`. Assert those substrings in the existing Netlify toml test. Document in NETLIFY.md.
2. Audit inline Starlight scripts under `script-src 'self'` (theme, search shortcut, sidebar persist). If they are blocked, add hashes or a narrow `'unsafe-inline'` — not a wide-open script policy.
3. Header trigger: gold hairline rectangle on navy, ivory label, no pill, no second navy brick. Shortcut chip is optional; if kept, gold/ivory, not gray-6.
4. Modal: ivory field, navy text, gold focus, radius 0, no empty 15rem min-height void. Result rows are ivory with navy type and a gold hairline, not stacked navy slabs. Magnifier and placeholder must meet contrast on that field.
5. Verify with `make build &&` preview (Pagefind is production-only). `make dev` will still stub search — say so in `sites/one/README.md`. Do not add Pagefind-in-dev unless a later cut needs it.

**Done when:** typing `install` on a production-like preview returns the Install page and family hits; the same query still works when the Netlify CSP header is applied (preview with the header, or a Playwright/CSP check); the trigger stays right-aligned next to GitHub.

### Cut 3 — One edge language

**Files:** `sites/one/src/styles/custom.css`, `sites/one/src/components/Banner.astro`, `QUALITY.md` chrome table.

1. Set `--mn-radius: 0` and apply it to search, dialog, pagination, sidebar current, asides, code, mobile TOC. Match [webpage `global.css`](https://github.com/MajestaNet/webpage/blob/main/src/styles/global.css): cards are hairline + `color-mix(white 70%, ivory)`, hover gold-navy border, no drop shadow.
2. One hairline everywhere, including sidebar rule and header (gold mix on the navy bar can stay; content dividers are navy 12%).
3. Banner: full content width, not a floating inset block. Fixture-only; still not a second navy header.
4. Focus: `outline: 2px solid var(--mn-gold); outline-offset: 3px` (webpage).
5. 404 keeps splash + the same header (QUALITY.md). Optional later: navy splash body like the company 404 — not required for this cut.
6. Copy the finished `custom.css` + header components into `sites/_template/` so Two does not re-invert tokens.

**Done when:** header, sidebar, content, pagination, search, and banner share square corners and one hairline; no circular controls; desktop and ~390px mobile both look like the same product.

## Out of scope

- Overlay copy, IA, pin, Scalar/OpenAPI (Phase 5).
- Dark/light toggle.
- Google Fonts `<link>` (Astro Fonts API stays).
- Changing search **position** (right is correct).
- Product repos.

## How to check

```bash
npm ci
make test
make docs-check
make build
# search index exists only after build:
npm run preview --workspace=@majestanet/one-docs   # http://127.0.0.1:4322/
```

Browser: home, `/install`, `/api/families`, `/404`; desktop ~1440 and mobile ~390; open search and type `install`; open the mobile menu and read nested API links.

Contrast: navy on ivory and ivory on navy only. No ivory-on-ivory headings, no navy-on-navy nested nav.
