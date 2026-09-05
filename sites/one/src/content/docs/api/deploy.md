---
title: Deploy API
description: Promote customer implementation on /deploy/v1. Scope deploy.
cmsPage: /api/deploy
---

Deploy treats **customer implementation** as a releasable artifact for this customer’s installs: pack, validate, test, and apply. Call `/deploy/v1` with scope `deploy`. It does not ship product images or managed `core` internals.

Image roll is [upgrades](/upgrades) and [Ops](/api/ops). CLI: [cli](/cli). Overview: [API families](/api/families).
