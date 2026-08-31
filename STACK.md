# Stack

Pinned when Phases 1–2 were scaffolded. Bump in this file and the lockfile together.

| Piece | Version |
|---|---|
| Node | `>=22.12.0` (`.nvmrc` 22.12) |
| npm | workspaces (`package-lock.json`) |
| Astro | `7.2.9` |
| `@astrojs/starlight` | `0.41.10` (Astro 7) |
| TypeScript | `~6.0.3` |
| Vitest | `^4.1.11` |

Shared library: `@majestanet/cms-core`. First site: `@majestanet/one-docs` (`sites/one`).

Fonts are downloaded at build through Astro’s Fonts API (Josefin Sans, Inter) and served from this origin — same pattern as `MajestaNet/webpage`. Do not add a Google Fonts `<link>`.
