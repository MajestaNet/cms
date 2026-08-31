# AGENTS.md

## What this repository is

Majesta CMS is the **public-docs aggregator** for Majesta Net products: overlay, pin, later Starlight, later one Netlify site per product subdomain.

It is **not** Majesta One, Majesta Two, or the company website. Those stay in `MajestaNet/one`, `MajestaNet/two`, and `MajestaNet/webpage`. Product images must never contain this tree.

**Status:** Phases 1–2 are scaffolded. `make docs-check` and `make build` must stay green. Pin is `unset`; production publish must fail closed. Do not default it to `main`.

## Read first

[DESIGN.md](./DESIGN.md), [AGENT.md](./AGENT.md), [BRAND.md](./BRAND.md), [sites/catalog.yaml](./sites/catalog.yaml). For One work, also [sites/one/AGENT.md](./sites/one/AGENT.md).

## Writer jobs (source-repo notify)

A change in a source repo (for example `MajestaNet/one`) is supposed to **run an agent in this repo**. That agent reviews the diff, updates the matching site overlay, and opens a **draft** PR. A human merge deploys the matching Netlify site.

1. Follow [AGENT.md](./AGENT.md) (router + fence).
2. Resolve `source` via `sites/catalog.yaml`. Unknown source → stop.
3. Follow **that** site’s `AGENT.md` only. One’s `v*` / MCP / family-HTTP rules are not Two’s.
4. Draft PR labeled `cms-update`. Do not merge. Do not use `NETLIFY_*`. Do not edit product repositories.

Cursor custom agents: [`.cursor/agents/cms-router.md`](./.cursor/agents/cms-router.md), [`.cursor/agents/cms-one.md`](./.cursor/agents/cms-one.md).

## Branding

Inherit [BRAND.md](./BRAND.md). Use SVG lockups in `brand/`. Do not type the wordmark. In prose the name is Majesta.Net. Gold on navy; navy on ivory.

## Names

The first source repo is `MajestaNet/one`. There is no `MajestaNet/ide`. Do not write that name into maps, payloads, or comments except to say it is retired.

## License

Code and docs are Apache-2.0. `brand/` is not — see [NOTICE](./NOTICE).
