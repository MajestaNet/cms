---
title: Majesta Two
description: Local control plane for one Mac. The iPhone enrolls the Apple Watch for push-to-talk.
cmsPage: /
---

Majesta Two is a local control plane for one Mac. Prompts stay on that machine. A local model answers, and closed actions can run on devices you bind on the private network.

The operator window starts the control plane. The iPhone and Apple Watch are how you talk to it away from the keyboard: the phone enrolls, the watch is push-to-talk. Those apps live in [two-mobile](https://github.com/MajestaNet/two-mobile). They do not run the model or the control plane.

| Start here | What it is |
|---|---|
| [Run on a Mac](/run) | Operator window, one catalog model, then chat |
| [iPhone and Watch](/phone) | Enroll on the same Wi-Fi, then hold the globe to speak |
| [Private edge](/edge) | Caddy and a client certificate. The API stays on loopback |
| [Devices](/devices) | Climate, television, vacuum, and ESPHome — off until you bind them |
| [Security](/security) | What must stay on the private network |

OpenRouter is an explicit sign-in on the Model page. It is not the default.

These pages match [MajestaNet/two@1acb47c](https://github.com/MajestaNet/two/commit/1acb47c3d4492a4f144bdd21cfc485a2d3c4e358) (19 November 2026). The package version in that commit is **0.1.0** ([`pyproject.toml`](https://github.com/MajestaNet/two/blob/1acb47c3d4492a4f144bdd21cfc485a2d3c4e358/pyproject.toml)). The iPhone and Apple Watch apps match [MajestaNet/two-mobile@fba186c](https://github.com/MajestaNet/two-mobile/commit/fba186c37a6f0b74f9d08cffa8d5d2b550a9e51a).
