# Security

This repository publishes **static public documentation**. It has no application runtime, no customer data, and no Netlify Functions.

- Do not put `NETLIFY_*`, Cursor API tokens, or product-install credentials in this tree.
- Agents that open overlay PRs need write access to **this** repo only.
- Source product repos are public; the aggregator fetches them without install credentials.
- Brand artwork under `brand/` is trademarked; it is not a secret.

Report vulnerabilities in **this** aggregator via GitHub Security Advisories on `MajestaNet/cms`. Do not file live vuln detail against a product as a public `cms-update` issue.

Product security contacts stay in each source repo (`MajestaNet/one` `SECURITY.md`, and so on).
