---
title: iPhone and Watch
description: Enroll the iPhone against a running Majesta Two Mac, then speak from the Apple Watch.
cmsPage: /phone
---

The iPhone and Apple Watch are a primary client of a Majesta Two install. The phone enrolls. The watch is push-to-talk. Recognition stays on the device. The Mac receives text.

The apps do not run the control plane, the model, or the operator window. Start [the Mac](/run) first. This page cannot use `127.0.0.1`.

Profiles are `chat` and `home-action` only. The phone and watch do not submit a self-build task and do not open the operator profile.

## What you need

- Majesta Two already running on the Mac, with the Server page up
- [Caddy](https://caddyserver.com/) on the Mac (`brew install caddy`)
- Xcode on the Mac, with the license accepted (`sudo xcodebuild -license`)
- The phone on the same Wi-Fi as the Mac for the first enrollment
- Tailscale on the Mac if the phone should keep working away from that Wi-Fi

The apps are [MajestaNet/two-mobile](https://github.com/MajestaNet/two-mobile), Apache-2.0, the same license as Majesta Two.

## Build the apps

```bash
git clone https://github.com/MajestaNet/two-mobile.git
cd two-mobile
swift test
open Two.xcworkspace
```

`swift test` is the offline check. It does not need Caddy or a running API.

In Xcode:

1. Select a Development Team so the shared keychain group can be signed. Do not commit a team id.
2. Run the **TwoPhone** scheme on a simulator or a phone. Run **TwoWatch** when you want the watch.

Bundle ids in `Config/Signing.xcconfig` are placeholders: `local.two.phone` and `local.two.phone.watch`. The watch id has to start with the phone id so the simulator will install the companion.

## Enroll

On the Mac, with the Server page already started and Caddy installed:

1. Choose **Start enrollment**. The window prints an address. That address is not `127.0.0.1`.
2. On the phone, on the same Wi-Fi, enter a username of letters, digits, and hyphens. If a host field appears, use the address the window printed.
3. Tap **Enroll**. The globe replaces the form.
4. Hold the globe to speak. The Mac receives text.
5. On the Mac, **Stop enrollment** once the phone is on the globe. The API and Caddy stay up.

The phone stores the home Wi-Fi address and the Mac’s Tailscale address. Away from that Wi-Fi it uses Tailscale. At home it uses the Wi-Fi address. Caddy on port 8443 requires the client certificate. The phone does not call port 8741.

The watch uses that same enrollment. It can resume `chat` and `home-action`.

The same edge can be prepared from the CLI with `two edge prepare` and `two edge enroll`. Those commands, and what must stay private, are on [Private edge](/edge).

## What the apps will not do

- They do not open Ollama, mlx-lm, DeepSeek Harness, a shell, or git.
- They do not embed `TWO_API_TOKEN` or `TWO_EDGE_TOKEN`. Caddy injects the edge token after mutual TLS succeeds.
- They do not add a public DNS name, a port forward, or a tunnel. If the private overlay is down, the Mac is unreachable.
- HomePods are not part of this build.

A workspace file named `two-dev.code-workspace`, saved beside the two checkouts and not inside either git repository, opens both repositories together.
