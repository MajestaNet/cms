# Site template

Copy this directory to `sites/<id>/` when adding a product. Then:

1. Register the site in [`../catalog.yaml`](../catalog.yaml).
2. Rewrite `AGENT.md` for **that** product. Do not keep One’s MCP / family-HTTP / `v*` rules unless they are actually true.
3. Replace the placeholders in `README.md` and `content-map.yaml`.
4. Leave `pin` as `unset` until the first real publish revision.

This folder is **not** a Netlify site.
