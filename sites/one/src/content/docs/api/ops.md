---
title: Ops API
description: Product image roll on /ops/v1. Scope ops.
cmsPage: /api/ops
---

Ops orchestrates a **product image** upgrade on this install: confirm, roll, gate on tests, roll back. Call `/ops/v1` with scope `ops`. It does not promote customer metadata or mutate business records.

Customer promote is [Deploy](/api/deploy). Operator narrative: [upgrades](/upgrades). Overview: [API families](/api/families).
