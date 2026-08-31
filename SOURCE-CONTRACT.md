# Source notify contract

When a **source** product repo changes, it asks **this** CMS repo to run a site agent. The agent reviews the public diff, updates overlay (± pin), and opens a draft PR. A human merge deploys the matching Netlify site.

Source repos do **not** host Astro or Netlify. They send a payload. The writer runs here.

Until a source repo wires `repository_dispatch`, paste the JSON (or a compare URL) into a `cms-update` issue in this repo. The loop is the same.

## Payload (`client_payload` / issue body)

```json
{
  "source": "MajestaNet/one",
  "kind": "merge",
  "ref": "refs/heads/main",
  "sha": "<commit sha>",
  "base": "<merge-base sha or empty>",
  "merged_pr": 123,
  "skip": false,
  "skip_reason": null,
  "paths": [
    "internal/httpapi/client_extras.go",
    "docs/api-families.md"
  ]
}
```

| Field | Meaning |
|---|---|
| `source` | GitHub `owner/repo`. Must match `source_repo` in [sites/catalog.yaml](./sites/catalog.yaml). There is no `MajestaNet/ide`. |
| `kind` | `merge` (default branch) or `tag` (`v*` for One) |
| `skip` | CMS agent should no-op |
| `skip_reason` | `docs-only` \| `no-mapped-paths` \| `duplicate` \| `cms-update-label` |
| `paths` | Changed files in the source repo (forward slashes) |

Do not send a `site` id. The catalog maps `source` → `sites/<id>/`. If `source` is unknown, the agent stops.

`skip_reason` values are hints. The site’s content map decides which public pages those paths belong to.

## Suggested source wiring (implement in the product repo, not here)

- `on.push` to default branch and `v*` tags, path-filtered to routes / allowlisted markdown / install packaging.
- `repository_dispatch` (or `workflow_dispatch` on the CMS repo) with the JSON above.
- Permissions on the source workflow: `contents: read`. A GitHub App or `CMS_DISPATCH_TOKEN` with **dispatch + contents: write on the CMS repo only** — never `NETLIFY_*`.

First product to wire: `MajestaNet/one`. Two (and others) get their own workflow only when that site exists in the catalog.

## What stays in the source repo forever

- Customer-facing markdown operators read on GitHub (`docs/self-host.md`, family APIs, …).
- Contributor / agent playbooks (not published).
- **No** Astro, **no** root `netlify.toml` for this aggregator, **no** `tools/one-docs`, **no** product `make docs` that builds this tree.

A path → page table for One lives in [sites/one/README.md](./sites/one/README.md) and [sites/one/AGENT.md](./sites/one/AGENT.md). The source repo may later duplicate a thin `docs-impact` script; it is not required to land this seed.
