---
title: API families
description: Client, Metadata, Deploy, Ops, and Auth. Not GET /describe.
cmsPage: /api/families
---

One exposes **five HTTP families**. Curated markdown lists path, method, scope, and what each call does — and does not. Do not generate a public catalog from `GET /describe`; that payload is install-local and includes customer objects.

| Family | Job |
|---|---|
| [Client](/api/client) | Data work on records |
| [Metadata](/api/metadata) | Shape this install |
| [Deploy](/api/deploy) | Promote customer implementation across environments |
| [Ops](/api/ops) | Operator endpoints |
| [Auth](/api/auth) | JWT, claim, identity |

Pin `One-API-Revision` on [revision](/api/revision).
