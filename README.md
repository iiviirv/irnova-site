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

The build is fully static (`base: './'`), so `dist/` can be hosted anywhere:

- **GitHub Pages** — push `dist/` to a `gh-pages` branch, or use an Actions workflow
- **Netlify / Vercel / Cloudflare Pages** — build command `npm run build`, publish dir `dist`
