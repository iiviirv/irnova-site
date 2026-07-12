// Cloudflare Pages Function — same-origin proxy for the Nova auto-installer.
//
// Why this exists: install.html runs in the visitor's browser, usually inside
// Iran, where *.workers.dev is filtered. It therefore can't reach a workers.dev
// proxy, and it can't call api.cloudflare.com directly either (that API sends no
// CORS headers). This function is served from the site's own custom domain
// (novaproxy.online — reachable in Iran), so the browser only ever talks to a
// same-origin URL. The actual upstream calls happen here, on Cloudflare's edge,
// where every host below is reachable.
//
// Usage from the page:  fetch('/cf?url=<encoded target>', { method, headers, body })
//
// Locked to the hosts the installer needs, so it can't be abused as an open proxy.
// dash.cloudflare.com is the OAuth token endpoint the Nova app exchanges its
// sign-in code at; the app falls back to this proxy when the direct call is
// filtered (Iran), the same way the web installer routes api.cloudflare.com.
const ALLOW_EXACT = ['api.cloudflare.com', 'dash.cloudflare.com', 'raw.githubusercontent.com']

function hostAllowed(hostname) {
  if (ALLOW_EXACT.includes(hostname)) return true
  // The freshly deployed panel lives at <name>.<subdomain>.workers.dev; the
  // installer polls it (and downloads worker.js) through this proxy.
  return hostname.endsWith('.workers.dev')
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
}

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const target = new URL(request.url).searchParams.get('url')
  if (!target) {
    return new Response('Missing url parameter', { status: 400, headers: CORS })
  }

  let t
  try {
    t = new URL(target)
  } catch {
    return new Response('Invalid url', { status: 400, headers: CORS })
  }
  if (t.protocol !== 'https:' || !hostAllowed(t.hostname)) {
    return new Response('Host not allowed', { status: 403, headers: CORS })
  }

  // Forward only the headers the installer relies on.
  const headers = new Headers()
  const auth = request.headers.get('Authorization')
  if (auth) headers.set('Authorization', auth)
  const ctype = request.headers.get('Content-Type')
  if (ctype) headers.set('Content-Type', ctype)

  const init = { method: request.method, headers }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  let resp
  try {
    resp = await fetch(t.toString(), init)
  } catch (e) {
    return new Response('Upstream fetch failed: ' + ((e && e.message) || e), {
      status: 502,
      headers: CORS,
    })
  }

  // Pass the upstream status + body straight back, adding permissive CORS.
  // `new Response(body, resp)` keeps body and its content-encoding header together.
  const out = new Response(resp.body, resp)
  out.headers.set('Access-Control-Allow-Origin', '*')
  return out
}
