# Design — Majesta CMS aggregator

Public customer docs for Majesta products live on product subdomains (`one.majesta.net`, later others). This repo is the **publisher and overlay**. Each product Git repo remains the **source** of contract markdown (install, API, CLI). GitHub stays the contributor / coding-agent host.

## Locked decisions (this seed)

1. **First source repo is `MajestaNet/one`.** There is no `MajestaNet/ide`. Do not revive that name in maps, notify payloads, or agent copy.
2. **The write loop is source → this repo’s site agent → draft PR → human merge → that product’s Netlify site.** CI does not generate markdown. The agent does not deploy.
3. **Every site has its own `AGENT.md`.** One and Two are different products; they do not share a writer playbook.
4. **Visual identity is inherited from `MajestaNet/webpage`.** Tokens and artwork live in [BRAND.md](./BRAND.md) and [`brand/`](./brand/). Starlight (later) uses those marks; it does not invent a second identity.
5. **One’s production pin is a `v*` tag**, same version string as GHCR. Unset means not published. Never default One’s live host to product `main`.

## Thesis

> One public aggregator repo. When a source repo changes, an agent **in this repo** reviews the public diff and updates that product’s overlay (and, for versioned products, the source pin). A human merges the PR. Netlify auto-deploys **that product’s site**. Agents never hold `NETLIFY_*`. Product images never contain this tree.

```text
source repo (public OSS)
  merge to main and/or v* tag
       │  notify (dispatch: repo, sha, paths)  — see SOURCE-CONTRACT.md
       ▼
CMS repo
  sites/catalog.yaml  →  which site + which AGENT.md
  site agent → draft PR (overlay ± pin)
       │  human merge
       ▼
Netlify site for that package → product subdomain
```

Until a source repo wires `repository_dispatch`, a human (or a product-repo agent) pastes a compare URL or the JSON payload into a `cms-update` issue in **this** repo. The CMS agent still runs here. It still opens a draft PR here. The merge still deploys here.

## Why an aggregator (not in-product publisher)

Putting Starlight, `netlify.toml`, and a docs agent inside an installable product repo mixes vendor hosting with that product’s CI, image-boundary checks, and agent fences. A company-wide **CMS-as-source-of-truth** would duplicate prose and drift from releases. An aggregator keeps:

- **Write / validate / publish** unmixed
- **Pin + overlay** so public pages are not a second wiki
- **One Netlify vendor** and a shared global fence, with **per-site** writer instructions
- **Relevant deploys only** — One’s overlay change must not rebuild another host

## Roles (never mixed)

| Role | Owner | Must not |
|---|---|---|
| **Source** | Each product repo’s allowlisted markdown | Host Netlify; run Astro; store `NETLIFY_*` |
| **Write** | Site agent in this repo (`sites/<id>/AGENT.md`) | Merge its PR; `netlify deploy --prod`; edit product code |
| **Validate** | CMS CI (`docs-check` / Starlight build, later) | Generate markdown or OpenAPI |
| **Publish** | Netlify GitHub app on **this** repo’s `main` (per site) | Run on a source-repo push; live in product images |
| **Human** | Merge the CMS PR; first GA; DNS; site create | Be an in-browser CMS |

CI never writes markdown. The agent never deploys production.

## Pin + overlay (avoid a second wiki)

If the agent copies full markdown into this repo, two corpora drift. Prefer:

| Layer | Lives | Who changes it |
|---|---|---|
| **Pin** | `sites/<id>/pin` (git SHA or `vX.Y.Z` of the source repo) | Agent on a **release** notify; human on first cut |
| **Source markdown** | The product repo at that pin (fetched at **build time**) | Product contributors / feature agents |
| **Overlay** | `sites/<id>/` — sidebar, customer-tone wrappers, IA | That site’s CMS agent |

Off-allowlist links in included markdown are **rewritten to GitHub** at the pin (`blob/<tag|sha>/…`, or `HEAD` for fixtures). Mapped relative links become public page paths. The build does not fail on a playbook URL; it refuses to serve that URL on the subdomain.

**Per-product version rule** (do not flatten):

| Product | Production pin | Notify on `main` |
|---|---|---|
| Majesta One | Last `v*` tag (same string as GHCR) | Draft overlay PR only; do **not** move `one.majesta.net` |
| A future site that already publishes from `main` | Source `main` (or aggregator merge) | May auto-publish that site after the CMS PR merges |

`/v/X.Y/` snapshots for One stay **in that site’s build output** (last N minors; pick N at Phase 4, default 2), not as Netlify deploy permalinks. Older than N stays on GitHub at the product tag.

One has **no `v*` tags yet**. `sites/one/pin` is `unset`. Production HTML for `one.majesta.net` must fail closed until a human sets a tag. Do not substitute `main`.

## Per-site agents

Majesta One is an API-first dedicated install. Majesta Two is a private, always-on local inference control plane. Their public surfaces, pin rules, and “never publish” lists are not the same.

| Global (this repo) | Per site (`sites/<id>/AGENT.md`) |
|---|---|
| Draft PR, `cms-update` label, no merge, no `NETLIFY_*` | Pin rule (`v*` vs `main`) |
| Read `sites/catalog.yaml`, stay inside `sites/<id>/` | Content map and impact table |
| Do not edit source-repo product code | Tone, IA, lead verbs |
| Brand tokens from [BRAND.md](./BRAND.md) | What must stay off the subdomain |

The router playbook is [AGENT.md](./AGENT.md). Cursor agents: [`.cursor/agents/cms-router.md`](./.cursor/agents/cms-router.md) and [`.cursor/agents/cms-one.md`](./.cursor/agents/cms-one.md). Add `cms-<id>.md` when a new site is added.

## Two corpora (still)

| Corpus | Audience | Where | On the subdomain? |
|---|---|---|---|
| Public product docs | Operators, builders, ISVs | Allowlisted paths in the **source** repo + overlay here | **Yes** |
| Vendor / agent plane | Coding agents, Majesta engineers | Source `docs/architecture/*-playbook*`, `*-build-plan.md`, `backlog/`, `.cursor/` | **No** |

Do not glob a whole `docs/` tree. Use a per-site content map ([sites/one/content-map.yaml](./sites/one/content-map.yaml)).

## API docs (One)

**Now:** curated markdown per family (path, method, scope, what it does / does not). Overlay may customer-cut source pages that still speak in playbook voice.

**Later:** OpenAPI generated **from One’s Go** (or YAML diffed against that product’s mux), rendered with Scalar **inside** that product’s Starlight site. Never from `GET /describe` (install-local, includes customer objects). Never restore deleted Node OpenAPI stubs.

## Branding

Docs sites use the same identity as [majesta.net](https://majesta.net): gold lockup on reference navy, navy lockup on ivory, Josefin Sans for display, Inter for text. Source of truth for tokens and copy rules: [BRAND.md](./BRAND.md). Artwork: [`brand/`](./brand/).

The company apex (`majesta.net`) stays the existing `MajestaNet/webpage` Netlify site. This aggregator does not take over the marketing host.

## Secrets

| Secret | Where | Used for |
|---|---|---|
| GitHub token / App | CMS repo (PR write on **this** repo only) | Agent opens draft PRs |
| `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID` | Optional; only if a site cannot use the GitHub app | Human or release job — **never** the agent |
| Netlify GitHub App | Each Netlify site | Deploy Preview + production on CMS `main` |

Source repos stay readable without tokens (public). Do not put Netlify secrets in product repos. Do not store a Cursor API token in GitHub secrets unless a later decision says so.

## Non-goals

- Serving docs from a product API or a customer install
- Control IDE as the docs host
- A CMS database, Identity, Forms, or Netlify Functions (static HTML only)
- Auto-merging the agent PR
- Auto-publishing One production from `MajestaNet/one` `main` or from the agent
- A second static vendor (Vercel, Cloudflare Pages)
- Per-customer doc tenants or a login portal
- Publishing `backlog/` or live vulnerability detail
- Folding this build into any product `make ci`
- Domain aliases that serve the **same** HTML on every Majesta hostname
- Reusing One’s `AGENT.md` for Two (or any other product)
- Defaulting an unset pin to product `main`
- Relicensing `brand/` artwork as Apache-2.0
