# Brand — inherited from Majesta.Net webpage

Public docs hosts in this aggregator use the **same visual identity** as [`MajestaNet/webpage`](https://github.com/MajestaNet/webpage) / [majesta.net](https://majesta.net). Do not invent a second palette, a typed wordmark, or a “docs-only” logo.

Artwork copies live in [`brand/`](./brand/). Tokens below are taken from that site’s `DESIGN.md` (August 2026 identity).

## Tokens

| Token | Value | Use on docs sites |
|---|---|---|
| Reference navy | `#1B2E46` | Header, footer, dark field (~hero chrome) |
| Luminous gold | `#F6CF55` | Primary lockup on navy; not body text on ivory |
| Warm ivory | `#F5F1E8` | Light content field |
| Slate | `#697685` | Secondary text |
| Display | Josefin Sans Light / Regular | Titles, section labels |
| Text | Inter Regular / Medium | Body, UI, metadata |

## Rules

- The lockup is supplied SVG, not typed text. Do not recreate `MAJESTA.NET` in a font.
- In prose the name is **Majesta.Net**; `MAJESTA.NET` stays on the artwork.
- Gold is the mark on navy. Body copy is navy on ivory or ivory on navy.
- Full lockup stays above 180px wide; the globe symbol is the favicon.
- Fonts are served from this origin (later: Astro Fonts API, same as the website). Do not add a Google Fonts `<link>`.
- No dark/light toggle. The identity is navy + ivory, applied by section.

## Which file to use

| Surface | File |
|---|---|
| Header on navy | `brand/logo-gold.svg` |
| Header on ivory | `brand/logo-navy.svg` |
| `currentColor` contexts | `brand/logo.svg` |
| Tab icon | `brand/symbol-navy.svg` (navy globe, transparent field) |
| Touch / profile | `brand/symbol/gold-256.png` (and 512 / 1024) |

When Starlight is scaffolded, copy only the files a site serves into that site’s `public/brand/`. Keep `brand/` at repo root as the vendor original.

## License

`brand/` is **not** Apache-2.0. Trademarks of Majesta.Net; see [NOTICE](./NOTICE). Code and documentation in this repository remain Apache-2.0.
