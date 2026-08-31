# Sites

One directory per **Netlify site** / public hostname, registered in [catalog.yaml](./catalog.yaml). Shared brand artwork lives at repo-root [`brand/`](../brand/). Shared writer fence lives in [`AGENT.md`](../AGENT.md). **Each site keeps its own `AGENT.md`** — pin rule, IA, tone, and “never publish” list.

| Directory | Hostname | Source repo | Production pin | Site agent |
|---|---|---|---|---|
| [one/](./one/) | `one.majesta.net` | `MajestaNet/one` | `v*` (GHCR) | [one/AGENT.md](./one/AGENT.md) |

## Required files (every site)

| File | Role |
|---|---|
| `README.md` | Hostname, source repo, pin rule, public IA |
| `AGENT.md` | Writer playbook for **this** product only |
| `content-map.yaml` | Allowlisted source paths → public pages |
| `pin` | Production source revision (`unset` until first publish) |

Phase 2 (One): Starlight app files and `netlify.toml` live in `sites/one/`. Overlay pages are `src/content/docs/`. Mapped source markdown is included at build time from the pin (or `fixtures/<id>/` while unset). Do not commit a second wiki.

## Adding a product

1. Copy [`_template/`](./_template/) to `sites/<id>/`.
2. Write that product’s `AGENT.md` from scratch. Do not paste One’s playbook. One is an API-first dedicated install; Two is a private local inference control plane; a future site will differ again.
3. Fill `content-map.yaml` and `README.md`. Leave `pin` as `unset` until the pin rule is satisfied.
4. Add a row to [catalog.yaml](./catalog.yaml).
5. Add `.cursor/agents/cms-<id>.md` that points at the new `AGENT.md`.
6. Create a **new** Netlify site pointed at that package directory ([NETLIFY.md](../NETLIFY.md)). Do not hang a second product off domain aliases on an existing site.
