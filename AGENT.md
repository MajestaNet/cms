# CMS agent — global fence

For agents that update **public overlay** in this aggregator after a source-repo notify. Product-repo agents do not run this playbook.

**Design:** [DESIGN.md](./DESIGN.md) · **Contract:** [SOURCE-CONTRACT.md](./SOURCE-CONTRACT.md) · **Registry:** [sites/catalog.yaml](./sites/catalog.yaml)

This file is the **router and the hard fence**. Product-specific tone, pin rules, and impact tables live in `sites/<id>/AGENT.md`. One’s playbook is not Two’s.

The aggregator is a **publisher**. Site agents are the **writers**. CMS CI must not generate markdown.

## Plane fence

| May edit | Must not edit |
|---|---|
| `sites/<id>/**` for the site that owns the notify (overlay, sidebar, content map, `pin` when that site’s playbook allows) | Any product repo (`cmd/`, `internal/`, `migrations/`, `deploy/`, `src/`, …) |
| This playbook, catalog, and CMS design docs | A *different* site’s directory because the notify was convenient |
| | Merge the PR; `netlify deploy --prod`; use `NETLIFY_*` |

## What to do (notify job)

1. Read the notify payload (`source`, `ref`, `sha`, `paths[]`, `kind`: `merge` \| `tag`). Skip if `skip: true`.
2. Resolve `source` in [sites/catalog.yaml](./sites/catalog.yaml). If the repo is not registered, stop and say so — do not invent a site.
3. Read **that** site’s `AGENT.md`, `content-map.yaml`, and `README.md`. Follow them. Do not apply another product’s pin rule or tone.
4. Fetch the source repo at `sha` (public clone). Review the mapped sources. Update **overlay** so operators see what changed.
5. Open a **draft** PR on this repo labeled `cms-update`. Touch only `sites/<id>/` (and catalog only if the task is registering a site). Do not merge. Do not deploy.

Cursor Automation (dashboard) should launch [`.cursor/agents/cms-router.md`](./.cursor/agents/cms-router.md). A known One-only job may launch [`.cursor/agents/cms-one.md`](./.cursor/agents/cms-one.md) instead. Fallback: paste the prompt at the bottom of this file into a cloud agent.

## Loop guards

Skip (no PR) when:

1. Payload `skip` is true (`docs-only` source diff that the site map ignores, no mapped paths, duplicate SHA).
2. The only source changes are already reflected in an open `cms-update` PR for that SHA and site.
3. Notify is from a previous CMS-driven documentation-only change in the source (if a source repo ever labels that — optional).

## Checklist (CMS PR)

- [ ] Catalog resolved to exactly one site
- [ ] That site’s `AGENT.md` was followed (pin, tone, IA)
- [ ] Every mapped page from `paths[]` is addressed or explicitly unchanged with a reason
- [ ] Only that site’s `sites/<id>/` overlay (and pin if the site playbook says so) changed
- [ ] Customer tone; no agent-playbook voice
- [ ] PR is **draft**, labeled `cms-update`
- [ ] No merge, no Netlify token, no product-repo code edits

## Docs-update job (paste)

```text
Update Majesta public docs overlay from a source-repo notify.

Read first: the issue/dispatch payload, AGENT.md, DESIGN.md,
sites/catalog.yaml, then that site’s AGENT.md, content-map.yaml, and README.

Resolve the source repo to a site. Follow that site’s playbook only.
For each mapped page, update the overlay so operators and builders see
the new customer-facing behavior. Curated markdown only.

Do not edit product repositories. Do not apply another site’s pin rule.
Open a draft PR labeled cms-update on the CMS repo. Do not merge.
Do not netlify deploy --prod. Do not use NETLIFY_AUTH_TOKEN.
```
