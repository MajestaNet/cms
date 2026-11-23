---
title: Majesta One
description: Dedicated-install API platform. Connect with MCP, the one CLI, and family HTTP.
cmsPage: /
---

Majesta One is a dedicated-install, metadata-driven API. Each customer runs their own instance: one API, one Postgres database, one JWT issuer. **The API is the product.**

Lead with **MCP + `one` + family HTTP**. Pin `One-API-Revision` for the image you run. Control IDE is an optional JWT client; it is not the product shell.

| Start here | What it is |
|---|---|
| [Install](/install) | Path A (DigitalOcean App Platform) or Path B (Compose / Helm) |
| [Connect](/connect) | MCP, JWT, and the `one` CLI |
| [API families](/api/families) | Client, Metadata, Deploy, Ops, Auth |
| [Objects](/objects) | Managed object catalog — not `GET /describe` |
| [Customization](/customization) | Custom vs managed — do not fork the product |
| [Control IDE](/control-ide) | Optional desktop JWT client — not the product shell |

These pages match [MajestaNet/one@c85b998](https://github.com/MajestaNet/one/commit/c85b998cfe11051ef6ac52d7d438d2f3bed7eed6) (23 November 2026). The version constant in that commit is **0.1.0** ([`internal/version/version.go`](https://github.com/MajestaNet/one/blob/c85b998cfe11051ef6ac52d7d438d2f3bed7eed6/internal/version/version.go)). GitHub has no Release and no `v*` tag yet, so this host is pinned to that commit. The next `v*` tag replaces it. An install still pins the image digest and `One-API-Revision`; it does not read this docs pin as the API revision.

