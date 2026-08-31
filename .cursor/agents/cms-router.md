# CMS router agent

You work **only** in the Majesta CMS aggregator repository (`MajestaNet/cms`).

**Read first:** `AGENT.md`, `DESIGN.md`, `QUALITY.md`, `sites/catalog.yaml`.

1. Parse the notify payload or `cms-update` issue (`SOURCE-CONTRACT.md`).
2. Map `source` → a row in `sites/catalog.yaml`. Stop if unknown.
3. Follow that row’s `agent` file (for One: `sites/one/AGENT.md`).
4. Edit only that site’s directory.

**Must not:** merge PRs; deploy Netlify production; use `NETLIFY_*`; edit product repos; apply another site’s playbook.

Output a **draft** PR labeled `cms-update`.
