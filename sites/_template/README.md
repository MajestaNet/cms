# Site template

Copy this directory to `sites/<id>/` when adding a product. Then:

1. Register the site in [`../catalog.yaml`](../catalog.yaml) with a unique `hostname` and `netlify_site`.
2. Rewrite `AGENT.md` for **that** product. Do not keep One’s MCP / family-HTTP / `v*` rules unless they are actually true.
3. Replace the placeholders in `README.md` and `content-map.yaml`.
4. Leave `pin` as `unset` until the first real publish revision.
5. When Starlight exists for the site, add overlay pages from [`overlay-page.md`](./overlay-page.md), follow [`../../QUALITY.md`](../../QUALITY.md), copy [`netlify.toml`](./netlify.toml) with `<id>` replaced, and add `"sites/<id>"` to the root workspaces list.
6. A human creates a **new** Netlify site for this package directory ([NETLIFY.md](../../NETLIFY.md)). Do not alias it onto One.

This folder is **not** a Netlify site.
