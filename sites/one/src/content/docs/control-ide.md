---
title: Control IDE
description: Optional desktop client for a Majesta One install. The API, MCP, and the one CLI remain the product.
cmsPage: /control-ide
cmsFigures:
  - src: /setup/sign-in.png
    alt: Control IDE sign-in, with the install URL and the claim card.
    caption: Sign in. On App Platform the URL is your HTTPS origin.
  - src: /setup/launcher.png
    alt: Control IDE mode launcher with Operate, Build, Govern, and Settings.
    caption: Launcher after the install is claimed.
  - src: /setup/environments.png
    alt: Control IDE Settings, Environments, with the install connected.
    caption: Environments shows the connected install.
---

Control IDE is an optional desktop client for a Majesta One install. It signs in with a Majesta One JWT and calls the same family HTTP the API already exposes. It is not the installer, not the product shell, and not a hosted app. The DigitalOcean walkthrough, with these screenshots, is [Set up](/setup). Builders can also use [Connect](/connect) and the [`one` CLI](/cli).

The window is Electron. Customer distribution is a desktop installer. A browser session is not a supported install.

## Sign in, then pick a mode

Until a JWT is stored, the window is a sign-in screen: install claim, browser SSO or password, client credentials, or a pasted JWT. The session is restored from the OS keychain (or a local encrypted file when the keychain is missing) the next time you open the app. Sign out, or a rejected JWT, returns you to that screen.

After sign-in, four tiles fill the launcher. What you see depends on the scopes on that JWT. A person without deploy scope does not get Deploy chrome.

| Mode | Who it is for | What the window shows |
|---|---|---|
| Operate | Day-to-day work | Personal graph, list sheets, and tools you pin there |
| Build | Metadata and release | Objects, packages, repo, and the deploy pipeline |
| Govern | Identity admins | Users, integrations, and permissions |
| Settings | The person who connects this install | Account, hosting, and Environments (the JWT for this install) |

Hover the mode title in the top bar to return to the four tiles. The left rail and the right agent dock stay collapsed until you hover them.

## What a builder does in Build

1. Settings → Environments, and connect this install.
2. Build → Repo → Initialize from the sample, or clone the customer repo.
3. Edit objects and automations. The window writes the same metadata the API stores.
4. Commit, then Build → Deploy → pack the local repo HEAD, validate against the org, and deploy.

External editors and `one` remain enough for that loop. The IDE does not replace [family HTTP](/api/families) or [One-API-Revision](/api/revision).

## What this client does not do

- It does not install Majesta One. Path A and Path B are [Install](/install).
- It does not own AuthZ, Deploy, or the agent runtime. Those stay on the Go install.
- It is not required for MCP, the CLI, or curl.
- Chrome for new panels is frozen. This page describes the client you can run, not a roadmap.
