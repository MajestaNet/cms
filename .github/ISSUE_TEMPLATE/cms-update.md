---
name: CMS update
about: Notify this aggregator that a source repo changed
title: "cms-update: MajestaNet/<repo> <sha>"
labels:
  - cms-update
---

Paste a [SOURCE-CONTRACT.md](../../SOURCE-CONTRACT.md) payload, or a compare URL plus the fields below.

```json
{
  "source": "MajestaNet/one",
  "kind": "merge",
  "ref": "refs/heads/main",
  "sha": "",
  "base": "",
  "merged_pr": null,
  "skip": false,
  "skip_reason": null,
  "paths": []
}
```

The CMS agent runs **in this repository**. It opens a draft PR. It does not deploy.
