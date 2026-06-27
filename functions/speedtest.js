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

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB cap
const DEFAULT_BYTES = 6 * 1024 * 1024 // 6 MB
const BLOCK = 16 * 1024 // 16 KB source block of randomness (well under the
//                         65536-byte getRandomValues limit)

// A block of random bytes used as the source for every chunk. Random (not
// zeros) so nothing in the path can compress it and inflate the measured speed.
// Built lazily on the first request: Cloudflare Workers forbid generating random
// values in global (module top-level) scope.
let SOURCE = null
function source() {
  if (!SOURCE) {
    SOURCE = new Uint8Array(BLOCK)
    crypto.getRandomValues(SOURCE)
  }
  return SOURCE
}

export async function onRequest(context) {
  const { request } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const src = source()
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
      const len = Math.min(src.length, bytes - sent)
      // Enqueue a fresh copy each time — the runtime can detach an enqueued
      // buffer once it's written to the socket, so a shared view would fail.
      controller.enqueue(src.slice(0, len))
      sent += len
    },
  })

  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
