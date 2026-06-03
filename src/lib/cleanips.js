// Helpers for the Clean-IP generator.
//
// IMPORTANT: these are *candidate* Cloudflare IP ranges from public sources —
// they are NOT verified to be fast or unblocked on any particular network.
// "Clean" IPs are network- and location-specific, so results are best-effort.

// Cloudflare's official IPv4 ranges, bundled so the feature works even when the
// live sources (or GitHub) are unreachable. Mirrors NovaRadar's fallback list.
export const FALLBACK_CIDRS = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
]

function ipToInt(ip) {
  return ip.split('.').reduce((acc, o) => ((acc << 8) >>> 0) + (Number(o) & 255), 0) >>> 0
}

function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function cidrRange(cidr) {
  const [ip, bitsStr] = cidr.split('/')
  const bits = Number(bitsStr)
  if (!ip || Number.isNaN(bits)) return null
  const base = ipToInt(ip)
  const size = 2 ** (32 - bits)
  return [base, size]
}

// Generate `count` unique random IPs spread across the given CIDRs.
export function randomIPsFromCidrs(cidrs, count) {
  const ranges = cidrs.map(cidrRange).filter(Boolean)
  if (ranges.length === 0) return []
  const out = new Set()
  let guard = 0
  while (out.size < count && guard < count * 20) {
    guard++
    const [base, size] = ranges[Math.floor(Math.random() * ranges.length)]
    // avoid network/broadcast edges for larger blocks
    const offset = size > 4 ? 1 + Math.floor(Math.random() * (size - 2)) : Math.floor(Math.random() * size)
    out.add(intToIp((base + offset) >>> 0))
  }
  return [...out]
}

// Fetch aggregated sources from our same-origin Pages Function. Falls back to
// the bundled Cloudflare ranges if the function isn't available (e.g. local dev
// or if a source is down) — so the feature always works.
export async function fetchSources() {
  try {
    const res = await fetch('/api/clean-ips', { headers: { accept: 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.sources) && data.sources.length) return data.sources
    }
  } catch {
    /* fall through to bundled list */
  }
  return [{ id: 'official', name: 'Cloudflare Official', cidrs: FALLBACK_CIDRS }]
}
