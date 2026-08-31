# Fixtures

Per-site **source doubles** for CI and local Starlight while a production pin is `unset`.

| Directory | Site | Used when |
|---|---|---|
| [one/](./one/) | `sites/one` | `sites/one/pin` is `unset` and this is not a production publish |

Do not copy product `docs/` wholesale. Keep stubs short and path-accurate so `docs-check` can fail on a missing mapped file without hosting a second wiki.

Production (`CMS_PRODUCTION=1` or Netlify production context) must not read these directories.
