// Narrow same-origin relay used by the Nova installer and Nova Client when
// Cloudflare/GitHub endpoints are unreachable from Iran. This is intentionally
// an endpoint allowlist, not a general-purpose URL proxy.

const MAX_REQUEST_BYTES = 2 * 1024 * 1024
const API_PREFIX = '/client/v4'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Max-Age': '86400',
}

const SAFE = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function response(body, status, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...SAFE, ...extra } })
}

function apiAllowed(method, path) {
  if (method === 'GET' && path === `${API_PREFIX}/user/tokens/verify`) return true
  if (method === 'GET' && path === `${API_PREFIX}/accounts`) return true
  if (method === 'POST' && path === `${API_PREFIX}/graphql`) return true

  const account = `${API_PREFIX}/accounts/[^/]+`
  if (new RegExp(`^${account}/workers/subdomain$`).test(path)) {
    return method === 'GET' || method === 'PUT'
  }
  if (new RegExp(`^${account}/workers/scripts$`).test(path)) return method === 'GET'
  if (new RegExp(`^${account}/workers/scripts/[^/]+$`).test(path)) {
    return method === 'GET' || method === 'PUT' || method === 'DELETE'
  }
  if (new RegExp(`^${account}/workers/scripts/[^/]+/content$`).test(path)) {
    return method === 'PUT'
  }
  if (new RegExp(`^${account}/workers/scripts/[^/]+/settings$`).test(path)) {
    return method === 'GET'
  }
  if (new RegExp(`^${account}/workers/scripts/[^/]+/subdomain$`).test(path)) {
    return method === 'POST'
  }
  if (new RegExp(`^${account}/storage/kv/namespaces$`).test(path)) {
    return method === 'GET' || method === 'POST'
  }
  if (new RegExp(`^${account}/storage/kv/namespaces/[^/]+$`).test(path)) {
    return method === 'DELETE'
  }
  if (new RegExp(`^${account}/d1/database$`).test(path)) {
    return method === 'GET' || method === 'POST'
  }
  if (new RegExp(`^${account}/d1/database/[^/]+$`).test(path)) {
    return method === 'DELETE'
  }
  return false
}

function targetPolicy(method, target) {
  const path = target.pathname.replace(/\/+$/, '') || '/'

  if (target.hostname === 'api.cloudflare.com' &&
      apiAllowed(method, path)) {
    return { auth: true, contentType: true }
  }

  if (target.hostname === 'dash.cloudflare.com' &&
      method === 'POST' && path === '/oauth2/token') {
    return { auth: false, contentType: true }
  }

  if (target.hostname === 'raw.githubusercontent.com' && method === 'GET' &&
      /^\/IRNova\/Nova-Proxy\/(?:main|refs\/heads\/main|[0-9a-f]{7,40})\/worker\.js$/.test(path)) {
    return { auth: false, contentType: false }
  }

  if (target.hostname.endsWith('.workers.dev') &&
      (method === 'GET' || method === 'HEAD') && path === '/install') {
    return { auth: false, contentType: false }
  }

  return null
}

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return response(null, 204)

  let target
  try {
    const raw = new URL(request.url).searchParams.get('url')
    if (!raw) return response('Missing url parameter', 400)
    target = new URL(raw)
  } catch {
    return response('Invalid url', 400)
  }

  if (target.protocol !== 'https:' || target.username || target.password) {
    return response('Target not allowed', 403)
  }

  const method = request.method.toUpperCase()
  const policy = targetPolicy(method, target)
  if (!policy) return response('Target not allowed', 403)

  const headers = new Headers()
  if (policy.auth) {
    const auth = request.headers.get('Authorization')
    if (auth) headers.set('Authorization', auth)
  }
  if (policy.contentType) {
    const contentType = request.headers.get('Content-Type')
    if (contentType) headers.set('Content-Type', contentType)
  }

  const init = { method, headers, redirect: 'manual' }
  if (method !== 'GET' && method !== 'HEAD') {
    const declared = Number(request.headers.get('Content-Length') || 0)
    if (declared > MAX_REQUEST_BYTES) return response('Request too large', 413)
    const body = await request.arrayBuffer()
    if (body.byteLength > MAX_REQUEST_BYTES) return response('Request too large', 413)
    init.body = body
  }

  let upstream
  try {
    upstream = await fetch(target.toString(), init)
  } catch {
    return response('Upstream fetch failed', 502)
  }

  // Do not follow redirects: a permitted URL must not be able to bounce the
  // relay to a destination outside this allowlist.
  const out = new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  })
  for (const [key, value] of Object.entries({ ...CORS, ...SAFE })) {
    out.headers.set(key, value)
  }
  out.headers.delete('Set-Cookie')
  return out
}
