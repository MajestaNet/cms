# Site: Majesta One (`one.majesta.net`)

Customer-facing docs for the Majesta One install (API-first, no embedded UI). Source markdown lives in the public [`MajestaNet/one`](https://github.com/MajestaNet/one) repo. This directory is overlay + pin + Starlight (`@majestanet/one-docs`). Netlify: [netlify.toml](./netlify.toml). Overlay pages: `src/content/docs/`. Mapped source markdown is included at **build time** from the pin (or `fixtures/one/` while pin is unset).

**Pin rule:** production follows the latest **`v*` tag**, same version string as `ghcr.io/majestanet/one-api`. A notify on `MajestaNet/one` `main` updates overlay in a draft PR only.

**Writer:** [AGENT.md](./AGENT.md) — do not use this playbook for Two or any other site.

**Search:** Pagefind exists only after `make build`. `make dev` (`npm run dev`) does not index; the modal is a stub. Use `npm run preview --workspace=@majestanet/one-docs` (http://127.0.0.1:4322/) to try search. Do not add Pagefind-in-dev.

## Public IA

```text
one.majesta.net
├── /                      Overview (short rewrite of README + glossary nouns)
├── /install               Path A App Platform + Path B Compose/Helm
├── /connect               MCP + JWT + CLI
├── /cli                   one project / org validate|deploy
├── /api
│   ├── /families          Client / Metadata / Deploy / Ops / Auth
│   ├── /revision          Pin One-API-Revision; min/current
│   ├── /client            Curated endpoint list (not describe)
│   ├── /metadata
│   ├── /deploy
│   ├── /ops
│   └── /auth
├── /modules               Managed packages
├── /objects               Managed object catalog (not GET /describe)
├── /customization         custom vs managed; never fork product
├── /upgrades              Image roll vs Deploy promote
├── /security              AuthZ posture, SECURITY.md pointer
└── /releases              GitHub Release + digest pin
```

**Keep on GitHub only** (footer “Source & contributing”, do not nav): agent playbooks, `*-build-plan.md`, `backlog/BP-*`, Control IDE internals, community `sdk/*/docs/*`, contributor DX (`local-development-mac.md`), contributor `docs/data-model.md`.

Control IDE is an optional JWT client, not the product shell. Lead with MCP + `one` + family HTTP.

Version URLs (do not invent a fourth axis):

| URL | Meaning |
|---|---|
| `https://one.majesta.net/` | Docs for the latest `v*` product tag |
| `https://one.majesta.net/v/0.14/` | Frozen snapshot for operators on `PRODUCT_VERSION=0.14.x` |
| `/api/revision` on each snapshot | `apiRevision.min` / `current` for **that** image |

Do not version the site as `/client/v1` vs `/client/v2`.

## Impact path table (CMS agent)

First matching prefix wins; a file may map to more than one page (unique `path` values).

| Changed paths (glob, in `MajestaNet/one`) | Public page(s) |
|---|---|
| `internal/httpapi/client_*.go`, `internal/httpapi/server.go` (Client `Handle` lines) | `/api/client`, `/api/families` |
| `internal/httpapi/metadata_routes.go`, `internal/httpapi/sharing_routes.go` | `/api/metadata` |
| `internal/httpapi/deploy_routes.go`, `internal/httpapi/deploy_cloud_routes.go` | `/api/deploy` |
| `internal/httpapi/ops_routes.go` | `/api/ops` |
| `internal/httpapi/auth_routes.go`, `internal/httpapi/install_claim_routes.go` | `/api/auth` |
| `internal/httpapi/scim_routes.go` | `/connect` |
| `internal/httpapi/mcp_routes.go`, `internal/mcp/**`, `tools/one-mcp/**` | `/connect` |
| `internal/httpapi/revision.go`, `internal/compat/**` | `/api/revision` |
| `cmd/one/**` | `/cli` |
| `docs/self-host.md`, `deploy/docker-compose.yml`, `deploy/helm/**`, `deploy/digitalocean/**` | `/install` |
| `docs/builder-connect.md`, `docs/customer-connect.md` | `/connect` |
| `docs/customer-repo.md`, `docs/customer-developer-workflow.md` | `/cli` |
| `docs/api-families.md` | `/api/families` only (overview) |
| `docs/api/client.md` | `/api/client` |
| `docs/api/metadata.md` | `/api/metadata` |
| `docs/api/deploy.md` | `/api/deploy` |
| `docs/api/ops.md` | `/api/ops` |
| `docs/api/auth.md` | `/api/auth` |
| `docs/objects.md` | `/objects` |
| `docs/adr/025-api-revision-versioning.md` | `/api/revision` |
| `docs/customer-customizations.md` | `/customization` |
| `docs/product-upgrades.md`, `docs/ops.md` | `/upgrades` |
| `docs/release-cicd.md` | `/releases` |
| `docs/security.md`, `SECURITY.md` | `/security` |
| `docs/modules/**` | `/modules` |
| `README.md`, `docs/glossary.md` | `/` |
| `docs/api/**` | matching `/api/...` page (`docs/api/README.md` is not a public route) |

Family pages include `docs/api/{client,metadata,deploy,ops,auth}.md`. Do not paste `docs/api-families.md` onto those five routes. Do not map `docs/data-model.md` or `GET /describe`.

## Overlay vs source voice

Family HTTP pages in `docs/api/` are already a customer cut (path, method, scope, does / does not). Overlay leads introduce those files; they do not duplicate the endpoint tables. Off-allowlist links in source markdown must be rewritten or dropped at build time so playbooks do not 404-or-leak onto the subdomain.
