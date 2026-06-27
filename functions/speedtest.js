// Cloudflare Pages Function — same-origin download speed test.
//
// Why this exists: the IP Tools page can measure latency in the browser, but a
// real throughput test needs real bytes pulled across the visitor's connection.
// This endpoint streams `bytes` of incompressible data from Cloudflare's edge,
// served from the site's own domain (novaproxy.online — reachable in Iran), so
// the browser times an actual download and computes Mbps. It can't attribute
// speed to one specific clean IP (the browser picks the route), but it honestly
// reports the bandwidth the visitor gets to Cloudflare right now.
//
// Usage:  fetch('/speedtest?bytes=6000000')  then read the body and time it.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
}

const MAX_BYTES = 60 * 1024 * 1024 // 60 MB cap
const DEFAULT_BYTES = 6 * 1024 * 1024 // 6 MB
const CHUNK_SIZE = 64 * 1024 // 64 KB per chunk (getRandomValues max)

// One block of random bytes, reused per chunk. Random (not zeros) so nothing in
// the path can compress it and inflate the measured speed.
const CHUNK = new Uint8Array(CHUNK_SIZE)
crypto.getRandomValues(CHUNK)

export async function onRequest(context) {
  const { request } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const url = new URL(request.url)
  let bytes = parseInt(url.searchParams.get('bytes') || String(DEFAULT_BYTES), 10)
  if (!Number.isFinite(bytes) || bytes <= 0) bytes = DEFAULT_BYTES
  bytes = Math.min(bytes, MAX_BYTES)

  let sent = 0
  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= bytes) {
        controller.close()
        return
      }
      const remaining = bytes - sent
      const chunk = remaining >= CHUNK.length ? CHUNK : CHUNK.subarray(0, remaining)
      controller.enqueue(chunk)
      sent += chunk.length
    },
  })

  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(bytes),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
