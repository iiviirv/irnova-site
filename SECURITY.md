# Security and verification

novaproxy.online (this repository) hosts the project site and the one-click
`/install` wizard. This document explains how to verify that the live site is
built from this source, and how to report a problem.

## Verify that the live site is this source

- The site is a static build. Cloudflare Pages deploys it **directly from this
  repository's `main` branch** (Git integration): every commit to `main` is built
  by Cloudflare with `npm run build` and published. The Pages project is named
  `novaproxy` in [`wrangler.toml`](wrangler.toml), which also lists the production
  domains that project serves.
- Every push also runs the [`Build`](.github/workflows/build.yml) CI, which runs
  the same `npm ci && npm run build` and records the output hash, proving this
  source builds cleanly and reproducibly.
- To confirm the live site matches this source, check out the deployed commit and
  build it yourself:

  ```bash
  npm ci && npm run build   # then compare ./dist with what novaproxy.online serves
  ```

- The `/install` page and its `/cf` helper are in `public/install.html` and
  `functions/`, in the open, in this repo.

## Reporting a vulnerability

Please report privately first:

- Telegram: **[@irnova_proxy](https://t.me/irnova_proxy)**
- Or open a **private security advisory** on this repository (Security tab).

We do not condone harassment of anyone who reports an issue in good faith.
