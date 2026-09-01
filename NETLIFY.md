# Netlify — one CMS repo, many subdomains

**Yes:** one GitHub repository can drive many custom subdomains.  
**How:** create **one Netlify site per product**, all connected to **this** CMS repo (`MajestaNet/cms`).  
**Not:** one Netlify site with domain aliases (aliases serve the **same** HTML on every hostname).

Official model: [Monorepos](https://docs.netlify.com/build/configure-builds/monorepos/). Netlify does not spawn N sites from a single root file. A human adds N site entries (UI or API). This file is the operator procedure for that.

The loop: a **human merge** of a CMS PR is what publishes. Source-repo pushes (`MajestaNet/one`, later `MajestaNet/two`, …) do **not** build Netlify. Only the site whose package directory (and listed shared inputs) changed should build — see [`ignore`](#isolation-one-change-must-not-rebuild-another-host) below.

Agents never hold `NETLIFY_*`. They never create sites, attach domains, or `netlify deploy --prod`.

## Mental model

```text
MajestaNet/one  (source markdown; no Astro, no Netlify)
  merge to main and/or v* tag
       │  notify (dispatch or cms-update issue)  — SOURCE-CONTRACT.md
       ▼
MajestaNet/cms  (this repo)
  catalog.yaml → sites/one + sites/one/AGENT.md
  overlay PR (draft, label cms-update)
       │  human reviews and merges to main
       ▼
Netlify site  majesta-one-docs
  GitHub app on THIS repo
  package directory sites/one
  production hostname one.majesta.net
```

Later products repeat the **right-hand side** only: new `sites/<id>/`, new catalog row, **new** Netlify site, new CNAME. They share this GitHub repo. They do not share a Netlify site id, a `netlify.toml`, or a custom domain.

| Netlify site name | Package directory | Production hostname | Source repo | Pin |
|---|---|---|---|---|
| `majesta-one-docs` | `sites/one` | `one.majesta.net` | `MajestaNet/one` | `v*` (file `sites/one/pin`) |
| (later) `majesta-two-docs` | `sites/two` | `two.majesta.net` | that product’s repo | that site’s rule |

`netlify_site` in [`sites/catalog.yaml`](./sites/catalog.yaml) is the **Netlify UI site name**. Keep it unique. `sites/_template` is not a site.

## What this repo already has

You do **not** invent a build command in the Netlify UI. The One package already ships:

| In the tree | Role |
|---|---|
| [`sites/one/netlify.toml`](./sites/one/netlify.toml) | Build command, publish dir, `ignore`, headers, Node 22 |
| [`sites/_template/netlify.toml`](./sites/_template/netlify.toml) | Copy when adding Two (or any later site) |
| Root `package.json` workspaces | `npm ci` at **repo root** (base directory unset) |
| `URL` is `*.majesta.net` + pin `unset` | Production publish **fails closed** (does not fetch `main`) |
| `URL` is still `*.netlify.app` + pin `unset` | Fixture + `noindex` (first site-create deploy) |

There must be **no** root `netlify.toml`. `docs-check` enforces that, and that each catalog site’s `ignore` lists that site’s tree and shared inputs only.

Headers live in each site’s `netlify.toml`. `_redirects` / `_headers` files are optional; if you add them, they go in that site’s package directory (or its `dist/`), not at repo root.

---

## 1. Create `majesta-one-docs` (first site)

A Netlify team owner (same team that already hosts `majesta.net` if possible) and a GitHub org owner do this once. Coding agents do not.

### 1.1 Connect GitHub

1. In Netlify: **Add new project** (sometimes **Add new site**) → **Import an existing project**.
2. Install or authorize the **Netlify GitHub App** on the `MajestaNet` org, with access to **`MajestaNet/cms`**.
3. Select repository **`MajestaNet/cms`**. Do **not** connect `MajestaNet/one` (or any product repo). Those repos must not host Astro or store `NETLIFY_*`.
4. Production branch: **`main`**.

### 1.2 Pick the One package (monorepo)

If Netlify lists detected sites, choose the directory that is **`sites/one`**. If it offers **Other (configure manually)**, use that.

Then open **Project configuration → Build & deploy → Continuous deployment → Build settings** and set:

| Field | Value | Why |
|---|---|---|
| **Base directory** | *unset* (repository root `/`) | `npm ci` and workspaces run at root; `brand/` and `packages/cms-core` live there |
| **Package directory** | `sites/one` | Where Netlify reads **this** site’s `netlify.toml` |
| **Build command** | leave empty to use toml, or the toml `command` | `npm ci && npm test && npm run docs-check && npm run build --workspace=@majestanet/one-docs` |
| **Publish directory** | `sites/one/dist` | Relative to **base** (repo root), not to `sites/one` |
| **Node** | `22` | Also set in toml `NODE_VERSION` |

If the UI filled **Base directory** with `sites/one`, **clear it**. A base of `sites/one` makes `npm ci` miss the workspace root and breaks the lockfile.

Site name in Netlify: **`majesta-one-docs`** (must match `netlify_site` in the catalog).

### 1.3 Features that stay off

| Feature | Setting |
|---|---|
| Functions | Off (static HTML only) |
| Identity | Off |
| Forms | Off |
| Split Testing / edge handlers | Off |

### 1.4 Deploy Previews and production branch

Under **Build & deploy → Continuous deployment → Branches and deploy contexts** (wording varies):

- Production branch: **`main`**.
- **Deploy Previews**: on for pull requests against `main`.
- Branch deploys: optional; not used as product DNS.

On a CMS PR that touches One’s inputs, Netlify should run a **Deploy Preview** for `majesta-one-docs` only. `CONTEXT` is not `production`, so the build uses [`fixtures/one/`](./fixtures/one/) and the site is `noindex`. That is expected while `pin` is `unset`.

### 1.5 Production while `pin` is `unset`

`sites/one/pin` is currently `unset`. There is no `v*` tag on One yet. The aggregator must not fetch `MajestaNet/one` `main` as a stand-in.

Netlify’s **first deploy after you connect the repo is production context** (`CONTEXT=production`), even though it only lives at `*.netlify.app` until you attach a custom domain. People often call that a “preview.” It is not a Deploy Preview.

| Primary URL (`URL` env) | Unset pin |
|---|---|
| `https://<site>.netlify.app` | Fixture build + `noindex` (so the first site-create deploy can succeed) |
| `https://one.majesta.net` | **Fail closed** — will not fetch `main` |
| Deploy Preview / branch (`CONTEXT` ≠ `production`) | Fixture build + `noindex` |

Do **not** attach `one.majesta.net` until a human sets `pin` to a `v*` tag. Attaching it first makes the next production deploy fail with `refusing production publish`.

`npm test` runs inside that production context. Tests ignore Netlify `CONTEXT` unless `CMS_PRODUCTION=1`, so they keep asserting fixture mode while pin is unset.

When the first `v*` pin lands and `make build` is green locally with `CMS_PRODUCTION=1`, merge, wait for a successful production deploy, **then** point DNS at it.

---

## 2. DNS for `one.majesta.net`

Attach **one** custom domain on **this** Netlify site, not on the company apex site.

1. On `majesta-one-docs`: **Domain management → Add a domain → Add a domain you already own** → `one.majesta.net`.
2. Do this **after** the first successful production deploy (otherwise the hostname serves a failed deploy or a Netlify error page).
3. Configure DNS (pick the case that matches `majesta.net` today):

| DNS for `majesta.net` | Record for `one` |
|---|---|
| **External** (registrar, Cloudflare, …) | `CNAME` `one` → this site’s `*.netlify.app` hostname ([external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)) |
| **Netlify DNS** on this team | Add `one.majesta.net` on `majesta-one-docs` and let the existing `majesta.net` zone create the record for **this** site — not for the webpage site |

Apex `majesta.net` stays the existing `MajestaNet/webpage` Netlify site. Do not add `one.majesta.net` as a [domain alias](https://docs.netlify.com/manage/domains/configure-domains/add-a-domain-alias) on webpage. Do not add `two.majesta.net` as an alias on One later.

Netlify issues HTTPS for the custom domain after DNS verifies.

---

## 3. What “automated deploy” means here

| Event | Netlify |
|---|---|
| CMS PR opened/updated | Deploy Preview **if** that site’s `ignore` paths changed |
| Human merges the CMS PR to `main` | Production deploy for **that** site (same `ignore` rule) |
| Push to `MajestaNet/one` `main` | **Nothing** on Netlify. Notify → overlay draft PR only. One’s live pin does not move. |
| `v*` tag on `MajestaNet/one` | Notify `kind=tag` → pin-bump draft PR. After **human merge**, `one.majesta.net` can move. |
| Agent with `NETLIFY_AUTH_TOKEN` | Forbidden. The GitHub app is the publisher. |

“Applicable merges” are merges **on this repo** whose diff includes that site’s ignore paths (see next section). A merge that only edits `sites/two/` must not rebuild `one.majesta.net`.

Optional human fallback: `netlify deploy --prod` from a trusted machine, with `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID` in a **CMS GitHub Environment** (or 1Password), never in a product repo, never in an agent prompt.

---

## 4. Isolation: one change must not rebuild another host

By default, any commit under the repo root can trigger **all** connected Netlify sites. Each site’s `netlify.toml` **must** set [`ignore`](https://docs.netlify.com/build/configure-builds/ignore-builds/):

```toml
ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- sites/one brand packages/cms-core fixtures/one package.json package-lock.json"
```

Exit `0` (no diff in those paths) → Netlify **cancels** the build. Exit `1` → build continues.

| Path | Why it is on One’s list |
|---|---|
| `sites/one` | Overlay, pin, Starlight, this toml |
| `brand` | Shared lockups |
| `packages/cms-core` | Shared fetch / map / link rewrite |
| `fixtures/one` | Preview source while pin is unset |
| `package.json` / `package-lock.json` | Root workspace / Node deps |

When Two exists, its ignore lists `sites/two` and `fixtures/two` — **not** `sites/one`. `docs-check` fails if a site’s ignore includes another catalog site’s directory.

After Two is connected, set the team option **Multiple webhooks per repo** ([commit status notifications](https://docs.netlify.com/build/configure-builds/monorepos/#commit-status-notifications)) so each site can report on the same PR. Cancelled builds on the other host are success, not a bug.

Sanity check: open a PR that only edits `sites/one/src/content/docs/index.md`. One’s Deploy Preview should **build**. Any other connected docs site should **skip**.

---

## 5. Add `two.majesta.net` (and every later site)

Do **not** attach a second hostname to `majesta-one-docs`. Repeat the same shape.

### 5.1 In this repo (PR, then merge)

Follow [`sites/README.md`](./sites/README.md). In short:

1. Copy [`sites/_template/`](./sites/_template/) to `sites/<id>/`. Rewrite **that** product’s `AGENT.md` from scratch (Two is not One).
2. Copy [`sites/_template/netlify.toml`](./sites/_template/netlify.toml) into the new directory. Replace every `<id>` and the npm workspace name. The `ignore` list must not mention another product’s `sites/` or `fixtures/`.
3. Scaffold that site’s Starlight package (same Node floor as [STACK.md](./STACK.md)). Add `"sites/<id>"` to the root `package.json` `workspaces` array and run `npm install` so the lockfile knows it.
4. Add a **new** row to [`sites/catalog.yaml`](./sites/catalog.yaml): unique `id`, `source_repo`, `directory`, `hostname`, `netlify_site`, `agent`, `production_pin`, `pin_file`.
5. Add `.cursor/agents/cms-<id>.md`. Leave `pin` `unset` until that site’s pin rule is satisfied.
6. `make test` and `make docs-check` must stay green.

The router ([AGENT.md](./AGENT.md)) maps `notify.source` → that row. An unknown source stops. One’s `v*` / MCP / family-HTTP rules never apply to Two.

### 5.2 In Netlify (human)

1. **Add new project** again, same GitHub repo `MajestaNet/cms`, same production branch `main`.
2. Package directory **`sites/<id>`**. Base directory **unset**. Site name = catalog `netlify_site` (for Two, `majesta-two-docs` or whatever the row says).
3. Deploy Previews on. Functions / Identity / Forms off.
4. Same production-pin caution: do not attach `*.majesta.net` until that site’s pin is real. A first `*.netlify.app` deploy may use fixtures.
5. Custom domain: **one** hostname (`two.majesta.net`) on **this** new site. `CNAME` `two` → **this** site’s `*.netlify.app`, not One’s.

You can add a third and fourth site the same way. The limit is “one Netlify site entry per catalog row,” not a new GitHub repository.

---

## What not to use

| Mechanism | Result |
|---|---|
| Domain aliases on one site | Many hostnames, identical HTML |
| Branch subdomains (`foo--site.netlify.app`) | Previews only — not product DNS |
| One `dist/` + host-based routing | Needs edge/functions — out of scope |
| Path proxy (`majesta.net/one/` → another site) | Optional later; subdomains do not need it |
| Root `netlify.toml` shared by every site | Fights per-site package config |
| Connecting `MajestaNet/one` to Netlify | Mixes vendor hosting into the product repo |
| Defaulting an unset pin to `main` | Publishes trunk as if it were a release |

---

## Operator checklist (One, first time)

- [ ] Netlify GitHub App can read `MajestaNet/cms` (not the product repos)
- [ ] Site name `majesta-one-docs`, package directory `sites/one`, **base directory unset**
- [ ] Deploy Previews on; Functions / Identity / Forms off
- [ ] Do not attach `one.majesta.net` until `sites/one/pin` is a `v*` tag (unset pin fail-closes on that hostname)
- [ ] First production deploy at `*.netlify.app` is fixture + `noindex` while pin is unset — that is expected
- [ ] First production deploy green on the custom domain after that pin merge
- [ ] `one.majesta.net` CNAME (or Netlify DNS) points at **this** site only
- [ ] Apex `majesta.net` still the webpage site
- [ ] No `NETLIFY_*` in this repo, in product repos, or in agent playbooks

When Two is ready, run the same checklist with `sites/two` / `two.majesta.net` / a **new** Netlify site.

## Content-Security-Policy (Pagefind search)

Starlight search runs Pagefind in a WASM module and a `blob:` worker. Each site’s `netlify.toml` CSP must include:

- `script-src 'self' 'wasm-unsafe-eval'`
- `worker-src 'self' blob:`

Do **not** add `'unsafe-eval'`. `wasm-unsafe-eval` is the narrow WebAssembly compile exception; it is not a general eval hole.

`style-src 'self' 'unsafe-inline'` stays — Starlight and Pagefind inject layout CSS. Theme force is `/theme-light.js` (`'self'`), so that is not an inline script. An audit of the built HTML found Starlight still inlines a few snippets: the search shortcut chip, sidebar persist, and the mobile menu custom element. Those are blocked by `script-src 'self'` alone (the menu would not open). The extra token is a **narrow `'unsafe-inline'`** on `script-src` — not `'unsafe-eval'`, and not extra hosts. Do not widen `script-src` to `*`.

Pagefind exists only after `make build`. `make dev` does not index.

`packages/cms-core/tests/netlify.test.ts` asserts those two CSP substrings on `sites/one/netlify.toml` and `sites/_template/netlify.toml`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Production build: `pin is unset; refusing production publish` on `one.majesta.net` | Expected until a `v*` pin. Do not fetch `main`. Detach the custom domain or set the pin. |
| `npm test` fails `repo-check.test.ts` / `refusing production publish` | Netlify injects `CONTEXT=production` into `npm test`. Current `main` should ignore that inside Vitest. Redeploy this repo at a revision that includes that guard. |
| `npm ci` cannot find workspaces | Base directory was set to `sites/one`. Unset it. |
| Every connected site builds on every CMS commit | Missing or wrong `ignore`, or package directory not set so Netlify never reads that toml |
| `two.majesta.net` shows One’s docs | Domain alias on `majesta-one-docs`. Remove it; create a second site. |
| Deploy Preview looks like production | `CMS_PRODUCTION=1` set in the Netlify UI. Do not set that env var. |
