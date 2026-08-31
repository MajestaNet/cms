---
title: API revision
description: Pin One-API-Revision. min and current for this image.
cmsPage: /api/revision
---

Each image declares `apiRevision.min` and `current`. Clients send `One-API-Revision` so the install can refuse unknown or too-old revisions.

This page is not a parallel `/client/v1` vs `/client/v2` site tree. Version the **docs snapshot** as `/v/X.Y/` (later); version the **API** with the header.
