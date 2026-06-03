# IRNova — Showcase Site

A modern, single-page React + Vite site showcasing [IRNova](https://github.com/IRNova)'s
open-source networking and proxy tools: **Nova-Proxy**, **Nova-Proxy-App**, **NovaRadar**, and
**Tools**.

## Features

- ⚡ Built with **React 18 + Vite 6**
- 🎨 Dark, modern design with an animated network-graph hero background
- 🧩 Project cards, capabilities grid, and an about section — all data-driven from
  [`src/data/projects.js`](src/data/projects.js)
- ♿ Respects `prefers-reduced-motion`, responsive down to mobile
- 📦 Zero runtime UI dependencies (icons are inline SVG)

## Getting started

```bash
cd irnova-site
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Editing content

All project and capability content lives in [`src/data/projects.js`](src/data/projects.js).
Update star counts, descriptions, tags, or add new projects there — the UI updates automatically.

## Deploying

This site auto-deploys to **Cloudflare Pages** via Git integration: every push to
the production branch triggers a build (`npm run build`) and deploys `dist/`
plus the `functions/` Pages Functions. No manual step required.

Pages project build settings:

- **Root directory:** `irnova-site`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** pinned to 20 via `.node-version`

The build is fully static (`base: './'`), so `dist/` can alternatively be hosted
on any static host (Netlify, Vercel, GitHub Pages, etc.).

