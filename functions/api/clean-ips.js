// Cloudflare Pages Function: GET /api/clean-ips
// Aggregates public Cloudflare IP-range (CIDR) sources server-side, so users
// (e.g. on networks where GitHub is blocked) can still get the list from the
// site's own origin. Cached at the edge for an hour.
//
// Sources mirror NovaRadar's CIDR sources.

const SOURCES = [
  { id: 'official', name: 'Cloudflare Official', url: 'https://www.cloudflare.com/ips-v4/' },
  { id: 'cm', name: 'CM List', url: 'https://raw.githubusercontent.com/cmliu/cmliu/main/CF-CIDR.txt' },
  { id: 'as13335', name: 'AS13335 (Cloudflare)', url: 'https://raw.githubusercontent.com/ipverse/asn-ip/master/as/13335/ipv4-aggregated.txt' },
  { id: 'as209242', name: 'AS209242 (Cloudflare)', url: 'https://raw.githubusercontent.com/ipverse/asn-ip/master/as/209242/ipv4-aggregated.txt' },
]

const FALLBACK_CIDRS = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
]

const CIDR_RE = /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/

function parseCidrs(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => CIDR_RE.test(l))
}

export async function onRequest() {
  const results = await Promise.all(
    SOURCES.map(async (s) => {
      try {
        const res = await fetch(s.url, { cf: { cacheTtl: 3600, cacheEverything: true } })
        if (!res.ok) throw new Error(String(res.status))
        const cidrs = parseCidrs(await res.text())
        if (!cidrs.length) throw new Error('empty')
        return { id: s.id, name: s.name, cidrs }
      } catch {
        // Only the official source has a reliable bundled fallback.
        if (s.id === 'official') return { id: s.id, name: s.name, cidrs: FALLBACK_CIDRS }
        return null
      }
    }),
  )

  const sources = results.filter(Boolean)
  if (!sources.length) sources.push({ id: 'official', name: 'Cloudflare Official', cidrs: FALLBACK_CIDRS })

  return new Response(JSON.stringify({ sources, fetchedAt: new Date().toISOString() }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
