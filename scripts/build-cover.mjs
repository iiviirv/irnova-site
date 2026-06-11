import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'

// X / Twitter header. 1500x500 (3:1). Content is kept compact and within a
// centered safe band so platform cropping never clips the lockup, and the
// profile avatar in the lower-left corner stays clear.
const W = 1500
const H = 500

const FONT_DIR = 'node_modules/@fontsource/inter/files'
const fp = (w) => opentype.parse(readFileSync(`${FONT_DIR}/inter-latin-${w}-normal.woff`).buffer)
const f800 = fp(800)
const f600 = fp(600)
const f400 = fp(400)

// text -> centered path. charToGlyph avoids opentype's shaping engine.
function textPath(font, text, size, cx, baseline, { letterSpacing = 0 } = {}) {
  const scale = size / font.unitsPerEm
  const glyphs = [...text].map((ch) => font.charToGlyph(ch))
  let width = 0
  for (const g of glyphs) width += g.advanceWidth * scale + letterSpacing
  width -= letterSpacing
  let pen = cx - width / 2
  const full = new opentype.Path()
  for (const g of glyphs) {
    full.extend(g.getPath(pen, baseline, size))
    pen += g.advanceWidth * scale + letterSpacing
  }
  return { d: full.toPathData(2), width }
}

// ---- faint network motif (deterministic) ----
let seed = 7
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
const nodes = Array.from({ length: 22 }, () => ({ x: rnd() * W, y: rnd() * H, r: 1 + rnd() * 2 }))
let lines = ''
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
    if (d < 200) {
      const op = (0.1 * (1 - d / 200)).toFixed(3)
      lines += `<line x1="${nodes[i].x.toFixed(1)}" y1="${nodes[i].y.toFixed(1)}" x2="${nodes[j].x.toFixed(1)}" y2="${nodes[j].y.toFixed(1)}" stroke="#5b6478" stroke-opacity="${op}" stroke-width="1"/>`
    }
  }
}
const dots = nodes
  .map((n) => `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="#22d3ee" fill-opacity="0.45"/>`)
  .join('')

// ---- lockup: badge + wordmark, shifted right of the avatar ----
// X overlays a circular avatar in the lower-left, so all content is centered
// on CX (right of that zone) to avoid being clipped.
const CX = 940
const badge = 84
const logoData = 'data:image/png;base64,' + readFileSync('brand/nova-logo-badge-round.png').toString('base64')
const wmSize = 58
const gap = 22
const centerY = 190
const wm = textPath(f800, 'Nova Proxy', wmSize, 0, 0, { letterSpacing: -1 })
const lockupW = badge + gap + wm.width
const lockupX = CX - lockupW / 2
const wmBaseline = centerY + wmSize * 0.34
const wordmark = textPath(f800, 'Nova Proxy', wmSize, lockupX + badge + gap + wm.width / 2, wmBaseline, { letterSpacing: -1 })

const tagline = textPath(f600, 'Keep the internet open, fast, and reachable.', 27, CX, 278, { letterSpacing: 0 })
const url = textPath(f400, 'novaproxy.online', 23, CX, 330, { letterSpacing: 1.5 })

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05060a"/><stop offset="1" stop-color="#0a0c14"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22d3ee"/><stop offset="0.5" stop-color="#818cf8"/><stop offset="1" stop-color="#a855f7"/>
    </linearGradient>
    <radialGradient id="glowC" cx="20%" cy="0%" r="60%">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowV" cx="85%" cy="25%" r="55%">
      <stop offset="0" stop-color="#a855f7" stop-opacity="0.20"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glowC)"/>
  <rect width="${W}" height="${H}" fill="url(#glowV)"/>
  <g>${lines}${dots}</g>

  <image x="${lockupX}" y="${centerY - badge / 2}" width="${badge}" height="${badge}" href="${logoData}"/>
  <path d="${wordmark.d}" fill="#eef1f7"/>
  <path d="${tagline.d}" fill="#aab3c6"/>
  <path d="${url.d}" fill="url(#brand)"/>
</svg>`

writeFileSync('brand/nova-x-cover.svg', svg)
const png = new Resvg(svg, { background: 'rgba(0,0,0,0)', fitTo: { mode: 'width', value: W } }).render().asPng()
writeFileSync('brand/nova-x-cover.png', png)
console.log('wrote brand/nova-x-cover.png', png.length, 'bytes')
