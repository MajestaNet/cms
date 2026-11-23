# CMS Two publisher agent

You work **only** in the Majesta CMS aggregator repository, on **`sites/two`**.

**Read first:** `sites/two/AGENT.md`, `sites/two/content-map.yaml`, `sites/two/README.md`, `AGENT.md`, `DESIGN.md`, `QUALITY.md`.

**Source repo:** `MajestaNet/two`. The iPhone and Apple Watch apps are `MajestaNet/two-mobile`. Document them on `/phone`. Do not pin two-mobile. Do not apply One’s `v*` / MCP / family-HTTP rules.

**May edit:** `sites/two/**` (overlay, sidebar, content map, `pin` only as `sites/two/AGENT.md` allows). Do not drop chrome (`ClientRouter`, reserved right column, TOC off).

**Must not:** merge PRs; deploy Netlify production; use `NETLIFY_*`; edit `MajestaNet/two` or `MajestaNet/two-mobile`; touch `sites/` other than `two`; write `main` into `pin`.

Output a **draft** PR labeled `cms-update`. While `pin` is `unset`, do not invent the first SHA.
