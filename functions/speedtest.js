// Cloudflare Pages Function — same-origin download speed test.
//
// Why this exists: the IP Tools page can measure latency in the browser, but a
// real throughput test needs real bytes pulled across the visitor's connection.
// This endpoint returns `bytes` of incompressible data from Cloudflare's edge,
// served from the site's own domain (novaproxy.online — reachable in Iran), so
// the browser times an actual download and computes Mbps. It can't attribute
// speed to one specific clean IP (the browser picks the route), but it honestly
// reports the bandwidth the visitor gets to Cloudflare right now.
//
// Usage:  fetch('/speedtest?bytes=6000000')  then read the body and time it.
//
// Implementation note: this returns a single fixed-size buffer (no streaming)
// so it behaves the same across every Workers compatibility date.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
}

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB cap (bounds memory + CPU)
const DEFAULT_BYTES = 6 * 1024 * 1024 // 6 MB
const RND_MAX = 65536 // getRandomValues fills at most 65536 bytes per call

export async function onRequest(context) {
  const { request } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const url = new URL(request.url)
  let bytes = parseInt(url.searchParams.get('bytes') || String(DEFAULT_BYTES), 10)
  if (!Number.isFinite(bytes) || bytes <= 0) bytes = DEFAULT_BYTES
  bytes = Math.min(bytes, MAX_BYTES)

  // Fill the whole payload with random (incompressible) bytes, in <=64 KB
  // windows because getRandomValues rejects larger requests.
  const buf = new Uint8Array(bytes)
  for (let off = 0; off < bytes; off += RND_MAX) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + RND_MAX, bytes)))
  }

  return new Response(buf, {
    headers: {
      ...CORS,
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
