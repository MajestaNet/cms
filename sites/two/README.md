# Site: Majesta Two (`two.majesta.net`)

Customer-facing docs for the Majesta Two local control plane. Source markdown lives in the public [`MajestaNet/two`](https://github.com/MajestaNet/two) repo. The iPhone and Apple Watch apps live in [`MajestaNet/two-mobile`](https://github.com/MajestaNet/two-mobile). This directory is overlay + pin + Starlight (`@majestanet/two-docs`). Netlify: [netlify.toml](./netlify.toml). Overlay pages: `src/content/docs/`.

**Pin rule:** production follows a **commit SHA** of `MajestaNet/two` (the published revision of `main`), or a `v*` tag if one is cut. The pin file must not contain the word `main`. Current pin: `1acb47c3d4492a4f144bdd21cfc485a2d3c4e358` (package `0.1.0`).

**Writer:** [AGENT.md](./AGENT.md) — do not use One’s playbook here.

**Search:** Pagefind exists only after `make build`. `npm run dev --workspace=@majestanet/two-docs` does not index. Use `npm run preview --workspace=@majestanet/two-docs` (http://127.0.0.1:4323/) to try search.

## Public IA

```text
two.majesta.net
├── /                 Overview
├── /run              Mac — operator window, model, chat, CLI
├── /phone            iPhone enrollment and Apple Watch push-to-talk
├── /edge             Private edge (Caddy, client certificate, Tailscale)
├── /devices          Climate, television, vacuum, ESPHome — off until bound
├── /console          Operator window and CLI as clients of one API
├── /operations       up, doctor, down, data directory
└── /security         Private by default
```

The phone and watch are a primary client. The operator window is how the Mac starts and how enrollment begins. The CLI is the same control plane without the window.

**Keep on GitHub only:** backlog, ADRs, `docs/architecture.md`, agent playbooks, the Swift contract’s implementation detail, evals, threat-model writeups, and the unbuilt development-loop GUI.

## Impact path table (CMS agent)

| Changed paths (glob, in `MajestaNet/two`) | Public page(s) |
|---|---|
| `README.md` | `/` |
| `docs/local.md` | `/run`, `/phone` |
| `docs/watch-client.md`, `src/two/edge.py`, `src/two/edge_enroll.py` | `/phone`, `/edge` |
| `docs/remote-access.md` | `/edge` |
| `docs/setup.md`, `docs/adapters.md`, `config/devices/**`, `src/two/devices/**` | `/devices` |
| `docs/channels.md`, `apps/console/**` | `/console`, `/run` |
| `docs/operations.md`, `src/two/runtime/**`, `src/two/cli.py` | `/operations`, `/run` |
| `SECURITY.md` | `/security` |

A change in `MajestaNet/two-mobile` is not a catalog notify. When that README’s enroll path changes, update `/phone` in an overlay PR. Do not fetch two-mobile as the production pin.
