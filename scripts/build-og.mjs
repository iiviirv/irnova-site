// Regenerate the Open Graph / social cards (1200x630) with the new Nova badge.
// EN card: satori (Latin shaping). FA card: fontkit shapes Persian (Arabic
// joining) to vector paths, composed into the same layout. resvg rasterizes.
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { decompress } from 'wawoff2'
import * as fontkit from 'fontkit'
import { readFileSync, writeFileSync } from 'node:fs'

const W = 1200
const H = 630
const FS = 'node_modules/@fontsource'
const ttf = async (p) => Buffer.from(await decompress(readFileSync(p)))

const inter800 = await ttf(`${FS}/inter/files/inter-latin-800-normal.woff2`)
const inter400 = await ttf(`${FS}/inter/files/inter-latin-400-normal.woff2`)
const vazir800 = await ttf(`${FS}/vazirmatn/files/vazirmatn-arabic-800-normal.woff2`)
const vazir400 = await ttf(`${FS}/vazirmatn/files/vazirmatn-arabic-400-normal.woff2`)

const logo = 'data:image/png;base64,' + readFileSync('brand/nova-logo-badge-round.png').toString('base64')

const GLOWS =
  'radial-gradient(circle at 20% 0%, rgba(34,211,238,0.20), transparent 55%), radial-gradient(circle at 85% 20%, rgba(168,85,247,0.22), transparent 55%)'

// A product card: accent bar, product name, one-line description.
function cardEN(title, sub, accent) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', width: 452,
        padding: '24px 28px', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
      },
      children: [
        { type: 'div', props: { style: { width: 46, height: 5, borderRadius: 3, backgroundColor: accent, marginBottom: 16 } } },
        { type: 'div', props: { style: { fontSize: 32, fontWeight: 800, color: '#eef1f7' }, children: title } },
        { type: 'div', props: { style: { marginTop: 8, fontSize: 21, fontWeight: 400, color: '#aab3c6' }, children: sub } },
      ],
    },
  }
}

// ---------------- English card via satori ----------------
async function renderEN(out) {
  const fonts = [
    { name: 'Inter', data: inter800, weight: 800, style: 'normal' },
    { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
  ]
  const node = {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 70px',
        backgroundColor: '#05060a', backgroundImage: GLOWS, fontFamily: 'Inter',
      },
      children: [
        { type: 'img', props: { src: logo, width: 118, height: 118, style: { marginBottom: 22 } } },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', fontSize: 52, fontWeight: 800, color: '#eef1f7',
              letterSpacing: -1, lineHeight: 1.1, textAlign: 'center', maxWidth: 1000,
            },
            children: 'One platform, two ways to beat censorship',
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: 28, marginTop: 40 },
            children: [
              cardEN('Nova Proxy', 'Free, on your Cloudflare Worker', '#22d3ee'),
              cardEN('Nova Server', 'Self-hosted on your VPS', '#a855f7'),
            ],
          },
        },
        { type: 'div', props: { style: { marginTop: 36, fontSize: 24, fontWeight: 400, color: '#38d6ee' }, children: 'novaproxy.online' } },
      ],
    },
  }
  const svg = await satori(node, { width: W, height: H, fonts })
  writeFileSync(out, new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng())
  console.log('wrote', out)
}

// ---------------- Persian card composed manually ----------------
const vFont = fontkit.create(vazir800)
const vFontLite = fontkit.create(vazir400)
const iFont = fontkit.create(inter400)

// Shape `text` and center it at cx on the given baseline. Handles RTL (Arabic
// joining) for fontkit fonts; Latin renders left-to-right.
function shape(font, text, size, cx, baseline, rtl) {
  const run = font.layout(text)
  const scale = size / font.unitsPerEm
  let width = 0
  for (const p of run.positions) width += p.xAdvance * scale
  let pen = cx - width / 2
  let d = ''
  // fontkit returns glyphs already in visual (left-to-right) order for RTL
  // runs, so we always lay out forward.
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i]
    const pos = run.positions[i]
    const p = g.path.scale(scale, -scale).translate(pen + pos.xOffset * scale, baseline - pos.yOffset * scale)
    d += p.toSVG()
    pen += pos.xAdvance * scale
  }
  return d
}

// One product card for the Persian layout: rounded panel, accent bar, name, sub.
function cardFA(cx, title, sub, accent) {
  const cardW = 452
  const cardH = 156
  const rectY = 308
  const x = cx - cardW / 2
  const barW = 46
  const rect = `<rect x="${x}" y="${rectY}" width="${cardW}" height="${cardH}" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`
  const bar = `<rect x="${cx - barW / 2}" y="${rectY + 26}" width="${barW}" height="5" rx="2.5" fill="${accent}"/>`
  const name = shape(vFont, title, 32, cx, rectY + 94, true)
  const desc = shape(vFontLite, sub, 22, cx, rectY + 138, true)
  return `${rect}${bar}<path d="${name}" fill="#eef1f7"/><path d="${desc}" fill="#aab3c6"/>`
}

function renderFA(out) {
  const slogan = shape(vFont, 'یک پلتفرم، دو راه برای عبور از سانسور', 46, W / 2, 262, true)
  const url = shape(iFont, 'novaproxy.online', 24, W / 2, 528, false)
  // RTL: the primary product (Nova Proxy) sits on the right.
  const rightCard = cardFA(W / 2 + 240, 'نوا پراکسی', 'رایگان، روی ورکر کلودفلر خودت', '#22d3ee')
  const leftCard = cardFA(W / 2 - 240, 'نوا سرور', 'خودمیزبان، روی سرور مجازی خودت', '#a855f7')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="gc" cx="20%" cy="0%" r="55%">
        <stop offset="0" stop-color="#22d3ee" stop-opacity="0.20"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="gv" cx="85%" cy="20%" r="55%">
        <stop offset="0" stop-color="#a855f7" stop-opacity="0.22"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#05060a"/>
    <rect width="${W}" height="${H}" fill="url(#gc)"/>
    <rect width="${W}" height="${H}" fill="url(#gv)"/>
    <image x="${W / 2 - 59}" y="44" width="118" height="118" href="${logo}"/>
    <path d="${slogan}" fill="#eef1f7"/>
    ${rightCard}
    ${leftCard}
    <path d="${url}" fill="#38d6ee"/>
  </svg>`
  writeFileSync(out, new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng())
  console.log('wrote', out)
}

await renderEN('public/og-en.png')
renderFA('public/og.png')
