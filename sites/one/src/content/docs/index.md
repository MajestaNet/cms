---
title: Majesta One
description: Dedicated-install API platform. Connect with MCP, the one CLI, and family HTTP.
cmsPage: /
---

Majesta One is a dedicated-install, metadata-driven API. Each customer runs their own instance: one API, one Postgres database, one JWT issuer. **The API is the product.**

Lead with **MCP + `one` + family HTTP**. Pin `One-API-Revision` for the image you run. Control IDE is an optional JWT client; it is not the product shell.

| Start here | What it is |
|---|---|
| [Set up](/setup) | DigitalOcean App Platform, then Control IDE on your computer |
| [Install](/install) | Path A reference, or Path B Compose / Helm |
| [Connect](/connect) | MCP, JWT, and the `one` CLI |
| [API families](/api/families) | Client, Metadata, Deploy, Ops, Auth |
| [Objects](/objects) | Managed object catalog — not `GET /describe` |
| [Customization](/customization) | Custom vs managed — do not fork the product |
| [Control IDE](/control-ide) | Optional desktop JWT client — not the product shell |

These pages match [MajestaNet/one@85281d5](https://github.com/MajestaNet/one/commit/85281d523665a9d894df6ec4662944fd0a3d644b) (23 November 2026). The version constant in that commit is **0.1.0** ([`internal/version/version.go`](https://github.com/MajestaNet/one/blob/85281d523665a9d894df6ec4662944fd0a3d644b/internal/version/version.go)). GitHub has no Release and no `v*` tag yet, so this host is pinned to that commit. The next `v*` tag replaces it. App Platform plus Control IDE is [Set up](/setup). An install still pins the image digest and `One-API-Revision`; it does not read this docs pin as the API revision.

