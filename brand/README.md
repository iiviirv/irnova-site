# Nova Proxy — Brand assets

## Primary logo

`nova-logo-badge.png` (1254×1254) is the current Nova Proxy mark — the neon "N"
badge. `nova-logo-badge-round.png` is the same mark circle-cropped with
transparent corners, for placing on arbitrary backgrounds (it's what the site
nav and the social cards use).

The full favicon / app-icon set in `../public/` is generated from the badge:
`favicon.svg`, `favicon.ico`, `favicon-16/32/48`, `apple-touch-icon`, and
`android-chrome-192/512`. Regenerate them with **`npm run icons`**
(`scripts/build-icons.mjs`).

## Legacy "N" line mark

The earlier minimal line mark is kept for reference and print:

| File | Format | Background | Best for |
|------|--------|-----------|----------|
| `nova-logo-gradient.svg` / `.png` | gradient | transparent | light backgrounds, general use |
| `nova-logo-tile.svg` / `.png` | gradient on dark tile | dark `#05060a` | tiles |
| `nova-logo-white.svg` / `.png` | solid white | transparent | dark backgrounds |
| `nova-logo-black.svg` / `.png` | solid black | transparent | print, stamps |

Brand gradient: `#22d3ee → #a855f7`.

## Social images

| File | Size | Best for | Regenerate |
|------|------|----------|------------|
| `nova-x-cover.svg` / `.png` | 1500×500 | X / Twitter header | `npm run cover` |
| `../public/og.png` | 1200×630 | Open Graph card (Persian) | `npm run og` |
| `../public/og-en.png` | 1200×630 | Open Graph card (English) | `npm run og` |

The X cover is centered so a profile avatar in the lower-left corner never
overlaps the logo or text. The OG cards shape Persian (`og.png`) with fontkit
so Arabic letterforms join correctly.
