# Site agent — Majesta One

Writer playbook for **`sites/one` only** (`one.majesta.net`). Global fence: [`../../AGENT.md`](../../AGENT.md). Do not use these pin rules or this tone for Two or any other site.

**Source repo:** [`MajestaNet/one`](https://github.com/MajestaNet/one)  
**Map:** [content-map.yaml](./content-map.yaml) · **IA:** [README.md](./README.md) · **Page standard:** [`../../QUALITY.md`](../../QUALITY.md)

## Why this site is not a generic docs job

Majesta One is a dedicated-install, metadata-driven API. Operators install an image, pin `One-API-Revision`, and call family HTTP (or MCP + `one`). They do not browse a SaaS UI. Control IDE is an optional JWT client.

If you are publishing another product, stop and open that product’s `AGENT.md`.

## Pin

| Notify `kind` | Pin file | Live host |
|---|---|---|
| `merge` on `main` | **Do not change** `pin` | Overlay-only draft PR. `one.majesta.net` stays on the last `v*`. |
| `tag` matching `v*` | Set `pin` to that tag (same string as GHCR) | After human merge, production can move. |
| anything else | No pin move | Ask; do not guess. |

`pin` is currently `unset`. There is no `v*` tag on One yet. Do not write `main` into `pin`. Do not fetch trunk as a stand-in for production.

## Tone

- Audience: operators, builders, ISVs — not coding agents.
- Lead with **MCP + `one` + family HTTP**.
- Mention Control IDE as an **optional JWT client**, not the product shell.
- Customer wording: path, method, scope, what it does / does not.
- Footer may link “Source & contributing” to `https://github.com/MajestaNet/one`. Do not nav to playbooks, BPs, or Control IDE internals.

## Never publish

- `docs/architecture/*-playbook*`, `*-build-plan.md`, `backlog/`, `.cursor/`, `AGENTS.md`
- `docs/data-model.md` (contributor storage; public catalog is `docs/objects.md`)
- `GET /client/v1/describe` as a public catalog (authenticated runtime schema)
- Live vulnerability detail
- Community `sdk/*/docs/*` as nav
- `docs/local-development-mac.md` as a public install path
- Anything from `MajestaNet/two` or `MajestaNet/webpage`

## What to do

1. Map `paths[]` with the impact table in [README.md](./README.md) and [content-map.yaml](./content-map.yaml).
2. Fetch `MajestaNet/one` at `sha` (public). Read the mapped sources.
3. Update overlay so each affected public page is the customer cut of the new behavior. Follow [QUALITY.md](../../QUALITY.md): overlay `title` is the only H1, links are site paths or real `https://` URLs, no `TODO`. Copy [`../_template/overlay-page.md`](../_template/overlay-page.md) when adding a route.
4. Move `pin` only on `kind=tag` as above.
5. Draft PR labeled `cms-update` touching only `sites/one/`.

## Branding

Apply [BRAND.md](../../BRAND.md) and [QUALITY.md](../../QUALITY.md) if chrome or a new page is in scope. Do not restyle the header per page. Gold lockup on navy, product noun “One” beside it, SVG lockups from `brand/`, never type the wordmark. Token mapping and the visual fix list: [CHROME.md](../../CHROME.md).
