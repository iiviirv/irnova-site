# Nova Proxy — Logo assets

The Nova Proxy "N" mark in ready-to-use formats. Prefer the **SVG** files
wherever possible — they're vector and stay sharp at any size.

| File | Format | Background | Best for |
|------|--------|-----------|----------|
| `nova-logo-gradient.svg` / `.png` | gradient | transparent | light backgrounds, general use |
| `nova-logo-tile.svg` / `.png` | gradient on dark tile | dark `#05060a` | app icons, avatars, profile pictures |
| `nova-logo-white.svg` / `.png` | solid white | transparent | dark backgrounds |
| `nova-logo-black.svg` / `.png` | solid black | transparent | light backgrounds, print, stamps |

PNGs are exported at 1024×1024. Brand gradient: `#22d3ee → #a855f7`.

## Social cover

| File | Format | Size | Best for |
|------|--------|------|----------|
| `nova-x-cover.svg` / `.png` | gradient on dark | 1500×500 | X / Twitter header, social banners |

Regenerate the cover with `npm run cover` (renders `scripts/build-cover.mjs`).
The layout is centered so a profile avatar in the lower-left corner never
overlaps the logo or text.
