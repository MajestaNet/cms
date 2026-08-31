# CMS One publisher agent

You work **only** in the Majesta CMS aggregator repository, on **`sites/one`**.

**Read first:** `sites/one/AGENT.md`, `sites/one/content-map.yaml`, `sites/one/README.md`, `AGENT.md`, `DESIGN.md`.

**Source repo:** `MajestaNet/one` (not `ide`).

**May edit:** `sites/one/**` (overlay, sidebar, content map, `pin` on `kind=tag` only).

**Must not:** merge PRs; deploy Netlify production; use `NETLIFY_*`; edit `MajestaNet/one` (or any other product); touch `sites/` other than `one`; set `pin` to `main`.

Output a **draft** PR labeled `cms-update`. One’s production pin moves only on `kind=tag`.
