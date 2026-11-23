---
title: Security
description: Majesta Two stays on the private network. The phone uses a client certificate. Tokens stay on the Mac.
cmsPage: /security
---

Majesta Two is private by default. Do not expose the inference server or the control API to the public internet.

| Port | Process | Who may connect |
|---|---|---|
| 8741 | Majesta Two API | This Mac, on `127.0.0.1` |
| 11434 | Ollama | This Mac, on `127.0.0.1` |
| 18080 | mlx-lm | This Mac, on `127.0.0.1` |
| 8443 | Caddy | The enrolled phone, on a private address, with a client certificate |

The phone does not call port 8741. It does not embed `TWO_API_TOKEN` or `TWO_EDGE_TOKEN`. Caddy injects the edge token after mutual TLS succeeds. The one-shot enroll listener is not the long-lived API. **Stop enrollment** closes it.

Do not commit `.env`, tokens, model weights, the edge directory, or a real LAN address. Do not email a client certificate. ECHONET Lite has no password: a guest network that can reach an air conditioner can send the same writes, so keep those units off a guest LAN. ESPHome and Ecovacs keys belong in the data-directory env, not in the binding file and not in git.

Away from home Wi-Fi, the phone uses Tailscale (or another private overlay you already run). That is not a public hostname. If the overlay is down, the Mac is unreachable. Do not add a port forward to paper over that.

Report a vulnerability through the source repository’s [security policy](https://github.com/MajestaNet/two/blob/main/SECURITY.md). This site does not publish live vulnerability detail.

The iPhone and Watch apps are the same Apache-2.0 license: [two-mobile](https://github.com/MajestaNet/two-mobile).
