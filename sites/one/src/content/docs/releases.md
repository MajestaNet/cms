---
title: Releases
description: GitHub Release, tag, and digest pin. Not channel-roll internals.
cmsPage: /releases
---

[MajestaNet/one](https://github.com/MajestaNet/one) has no GitHub Release and no `v*` tag. The published docs revision is [c85b998](https://github.com/MajestaNet/one/commit/c85b998cfe11051ef6ac52d7d438d2f3bed7eed6) (23 November 2026). In that commit, `internal/version.Version` is **0.1.0**, overridable at link time.

When a `v*` tag is cut, this host moves to that tag. The tag string is the same one used for the container image. Pin the image **digest** on the install, and set `PRODUCT_VERSION` to the version you are running. `One-API-Revision` is a separate pin; do not parse it out of `0.1.0`.

This site does not move on every push to `main`, and it does not attach a docs tarball to a GitHub Release.
