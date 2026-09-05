---
title: Auth API
description: JWT, install claim, and identity on /auth/v1.
cmsPage: /api/auth
---

Auth mints, refreshes, and revokes Majesta One JWTs for **this** install, and handles install claim. Call `/auth/v1`. It is not a data family — after you have a token, call Client, Metadata, Deploy, or Ops with the matching scope. Tokens from one install are not valid on another.

Connect with MCP + `one` + family HTTP: [connect](/connect). Overview: [API families](/api/families).
