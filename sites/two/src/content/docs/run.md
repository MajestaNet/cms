---
title: Run on a Mac
description: Start the operator window, install one local model, and send a chat.
cmsPage: /run
---

One Mac runs the control plane. This page is that Mac. The iPhone and Apple Watch are the next step, on [iPhone and Watch](/phone). They cannot use `127.0.0.1`.

You need a Mac, Python 3.12+, [uv](https://docs.astral.sh/uv/), Node.js, and git. Apple Silicon is required for a local mlx-lm model. The window can also install Ollama on macOS or Linux.

## Operator window

From a checkout of [Majesta Two](https://github.com/MajestaNet/two):

```bash
uv sync --dev
cd apps/console
npm install
npm start
```

Opening the window starts `two up` when the control plane is not already running. That is the API, scheduler, and worker on `127.0.0.1:8741`. Closing the window hides it. The menu bar opens it again. Quitting the window does not stop the control plane. **Stop** on the Server page does.

When `TWO_DATA_DIR` is unset, data goes to `~/Library/Application Support/two` on macOS.

## A model

On the Model page:

1. Leave **Ollama** selected, or choose **mlx-lm** on Apple Silicon. **OpenRouter** is the cloud choice. Sign in there if you want it. The key stays in the data directory and is not shown in the window.
2. If the runtime is missing, use **Install Ollama** or **Install mlx-lm**, then **Start**.
3. In Local Model Catalog, select one row and **Download**.
   - 16 GB unified memory: the 4B row (`qwen3.5:4b-mlx`).
   - 24 GB, the default profile: `qwen3.5:9b-mlx`.
4. If DeepSeek Harness is missing, **Install DeepSeek Harness**.

Chat stays disabled until the API is up and a local model is loaded, or OpenRouter is signed in. Ollama listens on `127.0.0.1:11434`. mlx-lm listens on `127.0.0.1:18080`. Neither is a remote-user endpoint.

## Chat

Open Chat and send a sentence. Leave the profile unset and the router chooses chat or an enabled device. This window does not offer `self-build`.

When the model answers, continue with [iPhone and Watch](/phone). Install Caddy first (`brew install caddy`) if the phone should enroll.

## CLI, without the window

```bash
uv sync --dev
uv run two setup --ollama-url http://127.0.0.1:11434/v1
uv run two up
uv run two doctor
uv run two chat send --text "hello"
```

`two up` is the three control-plane processes. Do not start `two api` again while that supervisor holds `127.0.0.1:8741`. `two doctor` exits 0 when the API is up and Ollama is Healthy or Cold. `two down` stops the supervisor.

Ollama has to be listening before a local turn runs. The window starts it. From the CLI, start it yourself. `uv run two setup --plan` prints the recipe and writes nothing.

Device bindings stay off until you enable them. Those steps are [Devices](/devices).
