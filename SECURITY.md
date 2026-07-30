# Security and verification

novaproxy.online (this repository) hosts the project site and the credential-free
`/setup/` instructions. This document explains how to verify that the live site
is built from this source, and how to report a problem.

## Verify that the live site is this source

- The site is a static build. Cloudflare Pages deploys it **directly from this
  repository's `main` branch** (Git integration): every commit to `main` is built
  by Cloudflare with `npm run build` and published. The Pages project is named
  `novaproxy` in [`wrangler.toml`](wrangler.toml), which also lists the production
  domains that project serves.
- A public, credential-free CI in
  [`IRNova/reproducible-builds`](https://github.com/IRNova/reproducible-builds)
  checks out this source, runs the same `npm ci && npm run build`, and publishes
  the output hash on every push and weekly, proving this source builds cleanly
  and reproducibly.
- To confirm the live site matches this source, check out the deployed commit and
  build it yourself:

  ```bash
  npm ci && npm run build   # then compare ./dist with what novaproxy.online serves
  ```

- The `/setup/` page is in `public/setup/index.html`. It does not accept a
  Cloudflare password or API token and makes no background network requests.
- The retired `/install` and `/install.html` routes return `410 Gone` from
  `functions/` and do not redirect visitors.

## Cloudflare account safety

- Never enter your Cloudflare password or API token on novaproxy.online.
- Cloudflare sign-in and deployment approval must happen only on
  `dash.cloudflare.com` or `deploy.workers.cloudflare.com`.
- The official Telegram bot username must be checked before use:
  `@IRNovaProxy_Bot`.

## Reporting a vulnerability

Please report privately first:

- Telegram: **[@irnova_proxy](https://t.me/irnova_proxy)**
- Or open a **private security advisory** on this repository (Security tab).

We do not condone harassment of anyone who reports an issue in good faith.
