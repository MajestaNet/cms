---
title: Operations
description: Start, health, and stop for the local control plane.
cmsPage: /operations
---

`two up` starts three processes: `two api`, `two scheduler`, and `two worker`. Do not start `two api` a second time while that supervisor holds `127.0.0.1:8741`.

`two doctor` exits 0 when the API is up and Ollama is Healthy or Cold. A non-zero exit means the model runtime is not ready for a turn. The operator window starts Ollama or mlx-lm from the Model page. From the CLI, start the runtime yourself before a local turn.

`two down` stops the supervisor. In the operator window, **Stop** on the Server page stops the control plane. Closing or quitting the window does not.

When `TWO_DATA_DIR` is unset, macOS uses `~/Library/Application Support/two`. Bindings, the edge CA, and the OpenRouter key live there. Do not commit that directory.

After you change a device binding or upgrade the worker, restart `two worker` so the running process loads the new file. Health of the phone path is the Server page: enrollment open or closed, Caddy up, API still on loopback. The phone checks are on [iPhone and Watch](/phone).

`uv run two setup --plan` prints the recipe and writes nothing. `two setup --ollama-url http://127.0.0.1:11434/v1` is the colocated default.

Compose under `deploy/compose` is an optional Linux packaging of the API, scheduler, and worker. It does not include an Ollama image. The Mac install does not use it. The API in that packaging still binds to `127.0.0.1:8741`.

Contributor checks (`make ci`) do not call a model and are not an operator health check. They stay on GitHub.
