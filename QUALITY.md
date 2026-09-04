# Page quality — overlay template for agents

Public docs pages are **overlay files** in `sites/<id>/src/content/docs/`. Mapped source markdown may be **included** under that overlay. Agents add and update pages here; they do not invent a second wiki and they do not paste playbooks onto a subdomain.

`make docs-check` enforces the mechanical rules. This file is the rest of the standard: chrome, page shape, links, headings.

**Brand:** [BRAND.md](./BRAND.md). **Fence:** [AGENT.md](./AGENT.md). **Per product:** `sites/<id>/AGENT.md`. Copy-paste overlay: [`sites/_template/overlay-page.md`](./sites/_template/overlay-page.md).

## Chrome (do not restyle per page)

Every HTML page on a product host uses the same shell:

| Piece | Rule |
|---|---|
| Header | Navy bar (`#1B2E46`). Gold lockup (`brand/logo-gold.svg`) ≥180px wide. Product name in gold next to the lockup (typed product noun only — never recreate the `MAJESTA.NET` wordmark). Search and GitHub on the right. Gold is the lockup; do not gold-outline the search brick. |
| Search | Right-aligned, larger than Starlight’s default, ivory on navy with a faint ivory hairline. Shortcut chip muted ivory if kept. Hover brightens ivory, it does not turn gold. |
| Theme | No dark/light toggle. Force light. Header tokens are **not** body tokens: navy icons on a navy bar are a defect. |
| Starlight tokens | Light-theme semantics: `--sl-color-white` is strongest **text** (navy), `--sl-color-black` is the **page fill** (ivory). Never set `white` to ivory to make the header work — override header controls locally. Ivory-on-ivory sidebar labels and H1s are a defect. |
| Type | Josefin Sans for H1–H3 and the product noun; Inter for body and nested nav. Starlight does not apply `--sl-font-headings` by itself. |
| Edges | Square corners (`border-radius: 0`). One hairline: `color-mix(in srgb, #1B2E46 12%, transparent)`. No pill search, no circular menu button. |
| Layout | Same header on docs, 404, with or without a sidebar. Do not use Starlight’s default grid that shifts the lockup against the content column. |
| Right column | Always reserved on doc pages. Empty for now (later screenshots/videos). Do not ship Starlight’s “On this page” TOC — it appears only on pages with headings and reflows the article. |
| Navigation | Prefetch sidebar targets. Header, left nav, and the empty right column must not flash or jump when changing pages. |
| Banner | Fixture/unpublished pin only. Not a second navy header. |
| Page title | Overlay `title` is the only H1 (Starlight `PageTitle`). Included source must not bring a competing H1. |
| Footer | “Source & contributing” → the product GitHub repo. No “Edit this page” on overlay files. Pagination titles are navy on ivory. |
| 404 | Same header. Splash body is allowed. Do not add `cmsPage`. |

One (`sites/one`) implements this via `src/components/Header.astro`, `Footer.astro`, `Head.astro`, `ThemeProvider.astro`, `TwoColumnContent.astro`, `PageSidebar.astro`, and `src/styles/custom.css`. Starlight light-theme tokens stay navy text / ivory fill — do not invert them for the header. Copy the finished chrome from [`sites/_template/`](./sites/_template/) (not the old inverted mapping) and change only the product noun and the source-repo URL. The three-cut plan plus the nav/search/aside follow-up is [CHROME.md](./CHROME.md).

## Overlay page shape

Every content-map route has exactly one overlay file:

| Map key | File |
|---|---|
| `/` | `src/content/docs/index.md` |
| `/install` | `src/content/docs/install.md` |
| `/api/families` | `src/content/docs/api/families.md` |

Frontmatter (required):

```yaml
---
title: Install
description: Path A App Platform or Path B Compose and Helm.
cmsPage: /install
---
```

Body:

1. **Lead** — one to three sentences, customer voice (operators / builders / ISVs). State what the page is and what it is not.
2. **On-site links only** — tables, lists, or sentences that point at other **content-map** routes (`/connect`, `/api/families`) or at `https://` URLs that exist.
3. **No placeholders** — no `TODO`, `FIXME`, “coming soon”, or “until the product repo splits”. If the source file is not ready, write a complete overlay-only page (`include: false` in the map) and link the canonical on-site page.

`404.md` is the exception: `template: splash`, no `cmsPage`.

## Headings

- Overlay `title` → H1. Do not put a second `#` heading in the overlay body.
- Included source: the first H1 is stripped (it is the source-file title). Leftover H1s are demoted. Multiple included files may use the stripped title as an H3 section label.
- Do not add a competing H2 such as “From the product repository”. The overlay lead is the introduction.

## Links

A href on the subdomain must resolve to a real public page, a real pin file on GitHub, or be omitted.

| Kind | What the build does |
|---|---|
| Site path (`/install`, `/api/families#auth`) | Keep. Trailing slashes normalized. Must exist in `content-map.yaml`. |
| Mapped source file (`./builder-connect.md`) | Rewrite to that file’s public page. |
| Playbook / backlog / `AGENTS.md` / `*-build-plan.md` | **Unwrap** — keep the link text, drop the href. Never nav vendor files on the host; do not send operators to a GitHub 404. |
| Unmapped file that exists at the **pin** | GitHub blob at the pin tag/sha. |
| Directory that exists at the pin | GitHub **tree** URL (not `blob`, which 404s). |
| Missing path, fixture-only path, or unset pin | Unwrap. Fixture builds must not emit `blob/HEAD/…` links. |
| Overlay repo-relative (`../docs/self-host.md`) | **Forbidden.** Overlay authors use site paths. `docs-check` fails. |

Do not write `/v/X.Y/` until Phase 4 actually emits those snapshots.

## Include vs overlay-only

In `content-map.yaml`:

- `include: true` (default) — build appends the pinned source file(s) after the overlay lead, with links rewritten as above. Use this when the source page is already a customer cut.
- `include: false` — overlay **is** the page. Sources are still required at the pin (docs-check). Use this for README dumps, playbook-voiced files, and family pages that would otherwise paste the same document five times.

If included markdown is still full of BP IDs and playbook asides, rewrite the overlay lead as the customer cut and set `include: false` rather than shipping vendor voice.

## New page checklist (agent)

1. Add the route to `sites/<id>/content-map.yaml` and to the Starlight `sidebar` in `astro.config.mjs`.
2. Copy [`sites/_template/overlay-page.md`](./sites/_template/overlay-page.md) to the matching `src/content/docs/…md`.
3. Set `title`, `description`, `cmsPage` (must equal the map key and the file path).
4. Write the lead. Link only to map routes or real `https://` URLs.
5. Decide `include`. Do not glob a whole `docs/` tree. Do not map playbooks, `backlog/`, `AGENTS.md`, or `*-build-plan.md`.
6. Follow **that** site’s `AGENT.md` (tone, pin rule). Do not reuse another product’s playbook.
7. Run `make test` and `make docs-check`. Fix overlay quality errors before opening the PR.

## What `docs-check` already fails

- Mapped source missing at the pin (or fixture, while unset)
- Forbidden source on a map
- Overlay file missing for a map key
- Extra docs file without `cmsPage` (except `404.md`)
- `cmsPage` / file path mismatch
- Missing `title` or `description`
- `TODO` / `FIXME` in overlay body
- Overlay links that are not a map route or an absolute URL
