# Build plan — Majesta CMS aggregator

**Status:** Phases 1–2 are in this repo (`@majestanet/cms-core`, Starlight under `sites/one`). Pin for One is still `unset`.  
**Design:** [DESIGN.md](./DESIGN.md) · **Agent:** [AGENT.md](./AGENT.md) · **Netlify:** [NETLIFY.md](./NETLIFY.md) · **Brand:** [BRAND.md](./BRAND.md)

## Goal

1. Publish customer-facing docs per product on its own subdomain.
2. Keep One in lockstep with `v*` (same version string as GHCR).
3. Guarantee a writer path when a source repo changes — without generating prose in CI.
4. Keep writer instructions **per site**, so One and Two cannot share a playbook.

## Phased delivery

### Phase 0 — Design seed (this PR)

Land the aggregator contract in `MajestaNet/cms`: design, global + per-site agents, notify payload, Netlify rules, One content map, brand tokens and artwork copied from `MajestaNet/webpage`. No Astro. No Netlify site entry. No product-repo workflows.

### Phase 1 — Layout + content maps (no Netlify required)

1. `sites/<id>/content-map.yaml` + `pin` file. Fail `docs-check` if a mapped source path is missing **at the pin**. If the pin is `unset`, fail closed for production publish (do not fetch `main`).
2. Shared ignore: vendor playbooks, `*-build-plan.md`, `backlog/`, `.cursor/`, `AGENTS.md` stay off every map.
3. Fixture tests for the **notify payload** parser ([SOURCE-CONTRACT.md](./SOURCE-CONTRACT.md)) and for `sites/catalog.yaml` routing — no product Go/Python packages.

### Phase 2 — Starlight per site

1. Scaffold Astro Starlight under `sites/one` (Node 22, same major floor as `webpage`: 22.12+). Pin versions in this repo’s stack note when you add `package.json`. Apply [BRAND.md](./BRAND.md) (gold-on-navy header, ivory content, lockup SVGs, no typed wordmark, fonts from this origin).
2. Build-time fetch of `MajestaNet/one` at `pin`. Include mapped markdown; do not commit a second wiki. Off-allowlist links in included markdown must not land on the subdomain (rewrite to GitHub or fail the build — pick one algorithm in the scaffold PR and test it).
3. Per-site `netlify.toml` in the package directory ([NETLIFY.md](./NETLIFY.md)).
4. `make docs-check` (or npm equivalent) in **this** repo only.
5. Connect the Netlify GitHub app for Deploy Previews. Custom domain can wait until Phase 4.

### Phase 3 — CMS agent wiring

Playbook: [AGENT.md](./AGENT.md) + `sites/<id>/AGENT.md`. Trigger: `repository_dispatch` (or issue labeled `cms-update`) with the notify payload. Output: **draft** PR on this repo. Forbidden: merge, Netlify prod, source-repo product code.

Cursor Automation (dashboard) is the recommended launcher (router agent). Fallback: paste the global prompt. Do not store a Cursor API token in GitHub secrets unless you later choose that.

Source-repo notify workflows (`MajestaNet/one` first) are implemented **in those repos**, against [SOURCE-CONTRACT.md](./SOURCE-CONTRACT.md). They are not this aggregator’s Phase 2.

### Phase 4 — Domains + production

1. One Netlify site per product; CNAME each subdomain. Operator steps (GitHub app, package directory, fail-closed pin, adding Two later): [NETLIFY.md](./NETLIFY.md).
2. Production auto-publish from **CMS** `main` **after** a reviewed overlay merge. That is not the same as publishing from a **source** `main`.
3. For One: production pin is `v*`; assemble `/v/X.Y/` in `sites/one` dist; keep last N minors (default 2 unless a later PR says 3).
4. Release notes on the product repo may link `https://one.majesta.net/v/X.Y/`. Do not attach a site tarball to the product GitHub Release.

### Phase 5 — Contract hardening (later)

OpenAPI from product Go + Scalar inside Starlight. Not in the first scaffold.

## Success criteria

- A visitor on `one.majesta.net` can install Path A/B, pin `One-API-Revision`, call family HTTP, and connect MCP/`one` without opening agent playbooks.
- Product `make ci` / image audit never build or copy this repo.
- CMS agent PRs are draft; production moves only after a human merge.
- One’s live subdomain tracks a `v*` pin, not `MajestaNet/one` trunk.
- Playbooks and backlog stay off every public map.
- A notify for One cannot be executed with Two’s (or any other site’s) instructions.

## Implementation prompt (CMS repo, Phases 1–2)

```text
Scaffold the Majesta CMS aggregator Phases 1–2 per BUILD-PLAN.md.

Read first: DESIGN.md, BRAND.md, NETLIFY.md, AGENT.md,
sites/README.md, sites/catalog.yaml, sites/one/README.md,
sites/one/AGENT.md, sites/one/content-map.yaml, SOURCE-CONTRACT.md.

Scope: this CMS repo only. Starlight under sites/one; pin + overlay;
content-map check; notify payload + catalog fixtures. Per-site netlify.toml.
Apply webpage branding (BRAND.md, brand/ artwork). Node 22.12+.

Do not edit Majesta One (or any product) application code.
Do not add NETLIFY_* to product repos.
Do not generate OpenAPI. Do not attach custom domains until Phase 4.
Do not default sites/one/pin to main while it is unset.
```
