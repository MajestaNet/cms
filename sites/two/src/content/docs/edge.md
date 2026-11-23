---
title: Private edge
description: How the iPhone reaches the Mac. The API stays on loopback. Caddy requires a client certificate.
cmsPage: /edge
---

The iPhone and Apple Watch reach the Mac only on a private address. The control API stays on `127.0.0.1:8741`. Caddy on port 8443 terminates mutual TLS and proxies to that loopback API. The usual buttons are **Start enrollment** and **Stop enrollment** on the Server page. The steps that use them are [iPhone and Watch](/phone).

Do not open the API, Ollama, or mlx-lm to the public internet. Do not add a public DNS name, a port forward, or a tunnel to reach the phone.

## Who can reach the host

| Client | How it connects | Public inbound port |
|---|---|---|
| CLI on this Mac | `127.0.0.1` | No |
| Operator window | This Mac | No |
| iPhone and Apple Watch | Caddy on the home address, client certificate, Tailscale away from that Wi-Fi | No |
| CLI on another machine | Private overlay and a token | No |

Ollama (`127.0.0.1:11434`) and mlx-lm (`127.0.0.1:18080`) are not remote-user endpoints. Only this Mac calls them.

## CLI, when you are not using the Server page

`two edge plan` writes nothing. `two edge prepare` issues the private CA and Caddyfile when they are missing. `two edge enroll` is the one-shot listener the phone uses.

```bash
uv run two edge plan --listen PRIVATE-LAN-IP
uv run two edge prepare --listen PRIVATE-LAN-IP
uv run two edge enroll --listen PRIVATE-LAN-IP
```

Replace `PRIVATE-LAN-IP` with this Mac’s address on the home network. The phone stores that host. It does not ship a default IP.

`two edge prepare` writes `$TWO_DATA_DIR/edge/` mode 0700. Do not commit those files, do not email the client certificate, and do not put a real LAN address in git. The API process is not given a LAN bind.

After enrollment, Caddy keeps listening. **Stop enrollment** closes the one-shot listener. It does not stop the API.

Away from the house Wi-Fi, the watch reaches the Mac through the paired iPhone’s private overlay. watchOS has no Tailscale client of its own. If that overlay is down, the UI says the Mac is unreachable.

The development-loop GUI is not built. OIDC is not accepted. Installations without this private edge still work from the CLI and the operator window on the Mac.
