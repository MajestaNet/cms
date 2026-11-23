---
title: Console and CLI
description: The operator window and the CLI are two clients of the same local control API.
cmsPage: /console
---

Majesta Two has one control API on `127.0.0.1:8741`. The operator window and the `two` CLI are clients of that API. The iPhone and Apple Watch are another client, over the [private edge](/edge), not a second control plane.

| Client | Where it runs | What it is for |
|---|---|---|
| Operator window | This Mac (`apps/console`) | Start the control plane, pick a model, chat, enroll the phone, bind a device |
| `two` CLI | This Mac, or another machine on a private overlay | The same control plane without the window |
| iPhone and Apple Watch | [two-mobile](https://github.com/MajestaNet/two-mobile) | Enroll, health, push-to-talk, approval |

Opening the window starts `two up` when nothing is already bound to port 8741. The window is shipped and stays closed until you open it. Quitting the window does not stop the API. **Stop** on the Server page does. The menu bar opens the window again.

The CLI path is on [Run on a Mac](/run): `two setup`, `two up`, `two doctor`, `two chat send`. Do not start `two api` a second time while `two up` holds the port.

Leave the profile unset on a chat sentence and the router chooses `chat` or an enabled device. `home-action` runs only when a [device binding](/devices) is enabled. The operator profile can propose a binding after an approval. An omitted profile does not route there. The phone and watch cannot open the operator profile and cannot submit a self-build task.

The window does not offer `self-build`. Adopting a worktree onto the running tree is not automatic and is not a phone action.

No messenger is required. The window or the CLI on this Mac is enough to use the install. The phone is how you speak to it from the watch.
