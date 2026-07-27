// Pull the latest guide markdown from the canonical GitHub sources at build time,
// so the website /guide page stays in sync with the repos without a manual copy.
// If GitHub is unreachable (network hiccup on the build host), we keep the
// committed copies so the build never fails and the page always has content.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const GUIDES = [
  { url: 'https://raw.githubusercontent.com/IRNova/Nova-Proxy/main/GUIDE.md', out: 'src/guides/nova-proxy.md' },
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
