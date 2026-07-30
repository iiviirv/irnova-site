// Pull guides that are safe to mirror verbatim from their canonical GitHub
// sources. The Nova Proxy guide is intentionally maintained in this repository
// because its setup URLs and anti-phishing instructions are site-specific.
// If GitHub is unreachable, keep the committed copy.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const GUIDES = [
  { url: 'https://raw.githubusercontent.com/IRNova/Nova-Server/main/GUIDE.md', out: 'src/guides/nova-server.md' },
]

for (const g of GUIDES) {
  try {
    const r = await fetch(g.url, { headers: { 'User-Agent': 'novaproxy-site-build' } })
    if (r.ok) {
      const md = await r.text()
      if (md && md.trim().length > 200) {
        writeFileSync(join(root, g.out), md)
        console.log(`[guides] pulled ${g.out} (${md.length} chars)`)
        continue
      }
    }
    console.warn(`[guides] keeping committed ${g.out} (HTTP ${r.status})`)
  } catch (e) {
    console.warn(`[guides] keeping committed ${g.out} (${e.message})`)
  }
}
