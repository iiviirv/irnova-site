import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'

const W = 1500
const H = 500

const FONT_DIR = 'node_modules/@fontsource/inter/files'
const fp = (w) => opentype.parse(
  readFileSync(`${FONT_DIR}/inter-latin-${w}-normal.woff`).buffer
)
const f800 = fp(800)
const f700 = fp(700)
const f400 = fp(400)

// text -> centered path. Returns {d, width}. Uses charToGlyph per character to
// avoid opentype's shaping engine (which trips on some font feature tables).
function textPath(font, text, size, cx, baseline, { letterSpacing = 0 } = {}) {
  const scale = size / font.unitsPerEm
  const glyphs = [...text].map((ch) => font.charToGlyph(ch))
  let width = 0
  for (const g of glyphs) width += g.advanceWidth * scale + letterSpacing
  width -= letterSpacing
  const x = cx - width / 2
  let pen = x
  const full = new opentype.Path()
  for (const g of glyphs) {
    full.extend(g.getPath(pen, baseline, size))
    pen += g.advanceWidth * scale + letterSpacing
  }
  return { d: full.toPathData(2), width, x }
}

// ---- decorative network nodes (deterministic) ----
let seed = 7
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
const nodes = Array.from({ length: 26 }, () => ({
  x: rnd() * W,
  y: rnd() * H,
  r: 1.2 + rnd() * 2.4,
}))
let lines = ''
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const dx = nodes[i].x - nodes[j].x
    const dy = nodes[i].y - nodes[j].y
    const d = Math.hypot(dx, dy)
    if (d < 190) {
      const op = (0.12 * (1 - d / 190)).toFixed(3)
      lines += `<line x1="${nodes[i].x.toFixed(1)}" y1="${nodes[i].y.toFixed(1)}" x2="${nodes[j].x.toFixed(1)}" y2="${nodes[j].y.toFixed(1)}" stroke="#5b6478" stroke-opacity="${op}" stroke-width="1"/>`
    }
  }
}
const dots = nodes
  .map((n) => `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="#22d3ee" fill-opacity="0.5"/>`)
  .join('')

// ---- Nova logo mark (from the site nav, viewBox 0 0 100 100) ----
const markScale = 0.92
const markSize = 100 * markScale
// wordmark
const wm = textPath(f800, 'Nova Proxy', 86, 0, 0, { letterSpacing: -1 })
const gap = 30
const lockupW = markSize * 0.78 + gap + wm.width
const lockupX = (W - lockupW) / 2
const markX = lockupX
const markBaselineY = 250
const wmCx = markX + markSize * 0.78 + gap + wm.width / 2
const wordmark = textPath(f800, 'Nova Proxy', 86, wmCx, markBaselineY + 30, { letterSpacing: -1 })

const pill = textPath(f700, 'OPEN-SOURCE NETWORKING TOOLS', 22, W / 2, 118, { letterSpacing: 3 })
const tagline = textPath(f700, 'Keep the internet open, fast, and reachable.', 34, W / 2, 350, { letterSpacing: -0.2 })
const url = textPath(f400, 'novaproxy.online', 26, W / 2, 432, { letterSpacing: 1 })

const pillPad = 26
const pillW = pill.width + pillPad * 2
const pillH = 44

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05060a"/>
      <stop offset="1" stop-color="#0a0c14"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="0.5" stop-color="#818cf8"/>
      <stop offset="1" stop-color="#a855f7"/>
    </linearGradient>
    <radialGradient id="glowC" cx="22%" cy="0%" r="60%">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowV" cx="85%" cy="20%" r="55%">
      <stop offset="0" stop-color="#a855f7" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glowC)"/>
  <rect width="${W}" height="${H}" fill="url(#glowV)"/>

  <g>${lines}${dots}</g>

  <!-- pill -->
  <g>
    <rect x="${(W - pillW) / 2}" y="${118 - pillH + 12}" width="${pillW}" height="${pillH}" rx="${pillH / 2}"
      fill="#22d3ee" fill-opacity="0.10" stroke="#22d3ee" stroke-opacity="0.35"/>
    <path d="${pill.d}" fill="#9fe9f6"/>
  </g>

  <!-- logo mark -->
  <g transform="translate(${markX}, ${markBaselineY - markSize + 8}) scale(${markScale})">
    <path d="M 28 22 L 28 64 A 13 13 0 0 0 54 64 L 54 36 A 13 13 0 0 1 80 36 L 80 78"
      fill="none" stroke="url(#brand)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- wordmark -->
  <path d="${wordmark.d}" fill="#eef1f7"/>

  <!-- tagline -->
  <path d="${tagline.d}" fill="#aab3c6"/>

  <!-- url -->
  <path d="${url.d}" fill="url(#brand)"/>
</svg>`

writeFileSync('brand/nova-x-cover.svg', svg)

const resvg = new Resvg(svg, { background: 'rgba(0,0,0,0)', fitTo: { mode: 'width', value: W } })
const png = resvg.render().asPng()
writeFileSync('brand/nova-x-cover.png', png)
console.log('wrote brand/nova-x-cover.png', png.length, 'bytes')
