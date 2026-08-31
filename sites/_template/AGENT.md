# Site agent — `<id>` (template)

Replace this file. The global fence in [`../../AGENT.md`](../../AGENT.md) still applies (draft PR, no merge, no `NETLIFY_*`, no product-repo edits). Page shape, chrome, and links: [`../../QUALITY.md`](../../QUALITY.md). Copy [`overlay-page.md`](./overlay-page.md) into `src/content/docs/` when this site has Starlight.

## Source

- GitHub repo:
- Production pin rule: (`tag-v` | `main` | other)
- Notify on default branch means:

## Tone and IA

Who is the public reader? What do you lead with? What is optional and must not be framed as the product?

## Never publish

List paths and topics that must stay off this subdomain even if they exist in the source repo.

## Pin behavior

- `kind=merge`:
- `kind=tag`:

## Impact

Point at this site’s `content-map.yaml` and list extra glob → page rules the map cannot express (for example Go mux files that should refresh an API page).
