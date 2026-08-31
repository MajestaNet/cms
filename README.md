# Majesta CMS

Public-docs aggregator for Majesta Net products. **One Git repository, one writer agent per site, many Netlify sites** (one custom subdomain each).

This is not a Contentful-style editor, not a database, and not part of any product image. Each product repository stays the **source** of contract markdown. This repository is the **publisher and overlay**.

## How a change becomes a page

```text
source repo  (e.g. MajestaNet/one)
  merge to main and/or a v* tag
       │
       │  notify this repo (dispatch or cms-update issue)
       ▼
this repo
  router reads sites/catalog.yaml
  site agent (sites/<id>/AGENT.md) reviews the source diff
  updates that site’s overlay (± pin on a release)
  opens a draft PR labeled cms-update
       │
       │  human reviews and merges
       ▼
Netlify site for that product only
  Deploy Preview on the PR
  production on this repo’s main
```

Agents never hold `NETLIFY_*`. Production publish is the Netlify GitHub app after a human merge. A change under `sites/one` must not rebuild another product’s host.

## Sites

| Directory | Source repo | Hostname | Production pin |
|---|---|---|---|
| [`sites/one`](./sites/one/) | [`MajestaNet/one`](https://github.com/MajestaNet/one) | `one.majesta.net` | latest `v*` tag (same string as GHCR) |

The machine-readable registry is [`sites/catalog.yaml`](./sites/catalog.yaml). Adding a product is a new `sites/<id>/` with its **own** `AGENT.md` — Majesta One (API-first install, public docs) is not Majesta Two (private local inference). Do not reuse One’s playbook.

## Docs

| Doc | Role |
|---|---|
| [DESIGN.md](./DESIGN.md) | Thesis, loop, pin + overlay, branding, non-goals |
| [BUILD-PLAN.md](./BUILD-PLAN.md) | Phases (this PR is design seed, not Starlight) |
| [AGENT.md](./AGENT.md) | Global writer fence; routes to the site playbook |
| [BRAND.md](./BRAND.md) | Majesta identity inherited from `webpage` |
| [NETLIFY.md](./NETLIFY.md) | One repo → many sites → many subdomains |
| [SOURCE-CONTRACT.md](./SOURCE-CONTRACT.md) | Notify payload the source repo sends here |
| [sites/README.md](./sites/README.md) | Per-site layout and how to add a product |

## Status

**Design seed.** Starlight, `docs-check`, and Netlify site entries are not in this tree yet. Pin for One is `unset` — do not pretend `one.majesta.net` is live, and do not default that pin to `MajestaNet/one` `main`.

All Majesta **source** repos this aggregator reads are public Apache-2.0. The aggregator fetches them over GitHub; it does not need install credentials.

## License

Code and documentation: [Apache License 2.0](LICENSE). Brand artwork under `brand/` is **not** Apache — see [NOTICE](NOTICE).
