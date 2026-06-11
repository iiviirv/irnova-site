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
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#05060a', backgroundImage: GLOWS, fontFamily: 'Inter',
      },
      children: [
        { type: 'img', props: { src: logo, width: 184, height: 184, style: { marginBottom: 26 } } },
        { type: 'div', props: { style: { fontSize: 78, fontWeight: 800, color: '#eef1f7', letterSpacing: -1 }, children: 'Nova Proxy' } },
        { type: 'div', props: { style: { marginTop: 18, fontSize: 34, fontWeight: 400, color: '#aab3c6' }, children: 'Keep the internet open, fast, and reachable.' } },
        { type: 'div', props: { style: { marginTop: 30, fontSize: 26, fontWeight: 400, color: '#38d6ee' }, children: 'novaproxy.online' } },
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

function renderFA(out) {
  const wordmark = shape(vFont, 'نوا پراکسی', 76, W / 2, 388, true)
  const tagline = shape(vFontLite, 'اینترنت را باز، سریع و در دسترس نگه دارید.', 34, W / 2, 452, true)
  const url = shape(iFont, 'novaproxy.online', 26, W / 2, 520, false)

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
    <image x="${W / 2 - 92}" y="56" width="184" height="184" href="${logo}"/>
    <path d="${wordmark}" fill="#eef1f7"/>
    <path d="${tagline}" fill="#aab3c6"/>
    <path d="${url}" fill="#38d6ee"/>
  </svg>`
  writeFileSync(out, new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng())
  console.log('wrote', out)
}

await renderEN('public/og-en.png')
renderFA('public/og.png')
