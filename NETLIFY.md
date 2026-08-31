# Netlify — one CMS repo, many subdomains

**Yes:** one GitHub repository can drive many custom subdomains.  
**How:** create **one Netlify site per product**, all connected to **this** CMS repo.  
**Not:** one Netlify site with domain aliases (aliases serve the **same** deploy on every hostname).

Official model: [Monorepos](https://docs.netlify.com/build/configure-builds/monorepos/). Netlify does not spawn N sites from a single root file. You add N site entries (UI or API).

The loop: a human merge of a CMS PR is what publishes. Source-repo pushes do **not** build Netlify. Only the site whose package directory changed should build (`ignore` below).

## Site per product

| Netlify site | Package directory | Production hostname | Source repo |
|---|---|---|---|
| `majesta-one-docs` | `sites/one` | `one.majesta.net` | `MajestaNet/one` |
| (later) other products | `sites/<id>` | that product’s host | that product’s repo |

For each site:

1. Add a new Netlify site → connect the **CMS** GitHub repo (not `MajestaNet/one`).
2. Set **package directory** to `sites/one` (etc.). Leave **base directory** unset (repo root) so shared tooling and `brand/` can live at root.
3. Put `netlify.toml`, `_redirects`, `_headers` in the **package directory**.
4. Attach **one** custom domain (CNAME → that site’s `*.netlify.app`, or Netlify DNS).
5. Turn **Deploy Previews** on. Production publish from **CMS** `main` after a human merge.
6. Functions / Identity / Forms **off**.

The file in the tree is [`sites/one/netlify.toml`](./sites/one/netlify.toml). Package directory `sites/one`, base directory unset (repo root). `ignore` must stay set: a change under `sites/two` must not rebuild `one.majesta.net`. `brand`, `packages/cms-core`, and `fixtures/one` are part of that site’s inputs.

Production context (`CONTEXT=production`) fails if `sites/one/pin` is `unset`. Deploy Previews use the fixture tree and `noindex`.

By default, any commit under the repo root can trigger **all** connected sites. Custom `ignore` is required.

## What not to use

| Mechanism | Result |
|---|---|
| Domain aliases on one site | Many hostnames, identical HTML |
| Branch subdomains (`foo--site.netlify.app`) | Previews only — not product DNS |
| One `dist/` + host-based routing | Needs edge/functions — out of scope |
| Path proxy (`majesta.net/one/` → another site) | Optional later; subdomains do not need it |
| Root `netlify.toml` shared by every site | Fights per-site package config |

Apex `majesta.net` stays its **own** Netlify site (`MajestaNet/webpage`). Do not reuse that site for One — different publish rules (`main` vs `v*` pin) and a different repo.

## Production vs preview (aggregator)

```text
CMS PR              → Deploy Preview (that site only, if ignore is correct)
CMS main            → production for sites whose pin/overlay/brand changed
MajestaNet/one main → notify only (One overlay draft; pin unchanged)
MajestaNet/one v*   → notify kind=tag → pin bump PR → after merge, one.majesta.net
```

Do not grant coding agents `NETLIFY_AUTH_TOKEN`. The GitHub app publishes after merge. Optional CLI `netlify deploy --prod` is a human/release fallback, secrets in a CMS GitHub Environment only.

## DNS

CNAME `one.majesta.net` → the **One** Netlify hostname. Company apex stays on the existing site and links here.
