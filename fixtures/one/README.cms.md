# Fixture source tree for `sites/one`

Stand-in for `MajestaNet/one` used when `sites/one/pin` is `unset`. Paths match [sites/one/content-map.yaml](../../sites/one/content-map.yaml). This is **not** a second wiki of the product.

Family HTTP pages, `docs/objects.md`, and `docs/modules/*.md` are customer-cut copies from One so `include: true` preview has the mapped sources. Do not treat this tree as production. Do not fetch `main` as a pin stand-in.

Production publish (`CMS_PRODUCTION=1` or Netlify `CONTEXT=production`) must not use this tree. It must fail closed until a `v*` pin is set.
