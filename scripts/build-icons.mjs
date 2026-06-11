// Regenerate the full Nova Proxy icon set from the master badge logo.
// Source: brand/nova-logo-badge.png  ->  favicons, app icons, nav mark.
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'node:fs'

const MASTER = 'brand/nova-logo-badge.png'

// Square export straight from the master (badge sits on its own dark field —
// ideal for browser tabs and the maskable app icons that get their own crop).
const square = (size, out) =>
  sharp(MASTER).resize(size, size, { fit: 'cover' }).png().toFile(out)

// Circle-cropped, transparent-corner export — used where the logo sits on an
// arbitrary background (nav bar in light/dark, embedded favicon.svg).
async function round(size, out) {
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  )
  return sharp(MASTER)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(out)
}

await Promise.all([
  // Browser favicons (square)
  square(16, 'public/favicon-16x16.png'),
  square(32, 'public/favicon-32x32.png'),
  square(48, 'public/favicon-48x48.png'),
  // App / PWA icons (square, full-bleed)
  square(180, 'public/apple-touch-icon.png'),
  square(192, 'public/android-chrome-192x192.png'),
  square(512, 'public/android-chrome-512x512.png'),
  // Round transparent marks
  round(256, 'src/assets/nova-mark.png'),
  round(512, 'brand/nova-logo-badge-round.png'),
])

// Multi-size .ico for legacy browsers
const ico = await pngToIco([
  'public/favicon-16x16.png',
  'public/favicon-32x32.png',
  'public/favicon-48x48.png',
])
writeFileSync('public/favicon.ico', ico)

// favicon.svg — wrap a small round PNG so the vector slot still resolves
const round64 = await sharp(MASTER)
  .resize(64, 64, { fit: 'cover' })
  .composite([
    { input: Buffer.from('<svg width="64" height="64"><circle cx="32" cy="32" r="32" fill="#fff"/></svg>'), blend: 'dest-in' },
  ])
  .png()
  .toBuffer()
const b64 = round64.toString('base64')
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${b64}"/></svg>\n`
)

console.log('icons rebuilt from', MASTER)
