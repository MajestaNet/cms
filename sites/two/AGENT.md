# Site agent — Majesta Two

Writer playbook for **`sites/two` only** (`two.majesta.net`). Global fence: [`../../AGENT.md`](../../AGENT.md). Do not use One’s `v*` rule, MCP lead, or family-HTTP tone here.

**Source repo:** [`MajestaNet/two`](https://github.com/MajestaNet/two)  
**Companion apps:** [`MajestaNet/two-mobile`](https://github.com/MajestaNet/two-mobile) (iPhone and Apple Watch). This site does not pin that repo.  
**Map:** [content-map.yaml](./content-map.yaml) · **IA:** [README.md](./README.md) · **Page standard:** [`../../QUALITY.md`](../../QUALITY.md)

## Why this site is not One

Majesta Two is a local control plane for one Mac. Prompts stay on that machine. The operator window starts the control plane and enrolls the phone. The iPhone and Apple Watch apps are a primary way to use the install: the phone enrolls, the watch is push-to-talk. They are not an optional aside.

One is an API-first dedicated install. Do not lead Two with MCP, family HTTP, or Control IDE.

## Pin

Two has no GHCR version string. Production follows a **commit SHA** of `MajestaNet/two` `main` (or a `v*` tag if one is ever cut). The pin file must not contain the word `main`.

| Notify `kind` | Pin file | Live host |
|---|---|---|
| `merge` on `main` while `pin` is `unset` | **Do not change** `pin` | Overlay-only draft PR. Do not invent the first SHA. |
| `merge` on `main` when `pin` is already a SHA | Set `pin` to the payload `sha` | After human merge, `two.majesta.net` can move. |
| `tag` matching `v*` | Set `pin` to that tag | After human merge, production can move. |
| anything else | No pin move | Ask; do not guess. |

`pin` is currently `unset`. Do not write `main` into `pin`. Do not fetch trunk as a stand-in for production.

## Tone

- Audience: the person who runs one Mac and a phone on that private network.
- Lead with the Mac control plane **and** the iPhone / Apple Watch. [iPhone and Watch](/phone) is a primary page, not a footnote.
- The operator window is how you start the Mac and enroll the phone. The CLI is the same control plane without the window.
- Profiles the phone and watch may use are `chat` and `home-action`. They do not submit a self-build task and they do not open the operator profile.
- Private by default. The API stays on `127.0.0.1:8741`. The phone talks to Caddy on port 8443 with a client certificate. Do not document a public bind, a port forward, or a tunnel.
- Footer links “Source & contributing” to `https://github.com/MajestaNet/two` and the apps to `https://github.com/MajestaNet/two-mobile`.

## Never publish

- `docs/backlog/**`, `docs/adrs/**`, `docs/architecture.md`, `**/*-playbook*`, `**/*-build-plan.md`, `AGENTS.md`, `.cursor/**`
- `docs/client-api-design.md`, `docs/client-threat-model.md`, `docs/viability.md`, `docs/public-repo.md`, `evals/**`
- Live vulnerability detail, real LAN addresses, tokens, `.env`, or model weights
- The B14 development-loop GUI (it is not built) as if it were a client
- Anything from `MajestaNet/one` or Control IDE

`docs/watch-client.md` is the server contract. The public page is the operator path on `/phone`. Do not paste the Swift implementation guide onto the subdomain.

## What to do

1. Map `paths[]` with the impact table in [README.md](./README.md) and [content-map.yaml](./content-map.yaml).
2. Fetch `MajestaNet/two` at `sha` (public). Read the mapped sources. When the change is the phone or watch path, also read the public `MajestaNet/two-mobile` README at that moment and update `/phone`. Do not add two-mobile as a second catalog source.
3. Update overlay so each affected public page is the customer cut. Follow [QUALITY.md](../../QUALITY.md): overlay `title` is the only H1, links are site paths or real `https://` URLs, no `TODO`. Keep `include: false` when the source file is an ADR-heavy contract.
4. Move `pin` only as the table above says.
5. Draft PR labeled `cms-update` touching only `sites/two/`.

## Branding

Apply [BRAND.md](../../BRAND.md) and [QUALITY.md](../../QUALITY.md) if chrome or a new page is in scope. Product noun “Two” beside the gold lockup. Do not type the wordmark.

Do **not** remove `ThemeProvider`’s `ClientRouter`, `Header` `transition:persist`, `TwoColumnContent`, empty `PageSidebar`, `tableOfContents: false`, or the `custom.css` `navigation: none` / `animation: none` rules. `make docs-check` fails if those are dropped.
