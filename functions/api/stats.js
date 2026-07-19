// Cloudflare Pages Function — visit & install counters for novaproxy.online.
//
// GET  /api/stats            → { visits:{total,today}, installs:{total,today}, day }
// POST /api/stats            → body { type:'visit'|'install', id? }; increments and
//                              returns the same shape as GET.
//
// Storage is the `nova_stats` D1 binding (see wrangler.toml). We keep one row per
// (kind, day) so the daily number is just that day's row and the total is a SUM.
// Increments use an atomic upsert, so concurrent hits never lose a count (unlike a
// KV read-modify-write). Installs carry a stable `id` (a hash of the freshly
// deployed panel's host) and are deduped through `install_seen`, so re-polls,
// re-runs, and a panel that phones home on every boot each count exactly once.
//
// "Today" resets on Tehran time (Asia/Tehran, fixed UTC+3:30, no DST) because
// that's the audience. The boundary is computed here so every caller agrees.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const JSON_HEADERS = {
  ...CORS,
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

// Installs shown on the site are more than the panels deployed since this counter
// went live: they also include every Nova app download (real, growing) plus the
// panels the Telegram bot built before the live counter existed. GitHub download
// totals are fetched at most once an hour (cached in the `meta` table) so the
// endpoint stays fast and never trips GitHub's rate limit.
const GH_REPOS = ['IRNova/Nova-Proxy-App', 'IRNova/Nova-Client', 'IRNova/NovaRadar']
const INSTALL_BASELINE = 2254 // historical bot-built panels, before the live counter
const GH_CACHE_TTL_MS = 60 * 60 * 1000

async function fetchGithubDownloads() {
  let total = 0
  for (const repo of GH_REPOS) {
    const resp = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
      headers: { 'User-Agent': 'nova-stats', Accept: 'application/vnd.github+json' },
      cf: { cacheTtl: 1800 },
    })
    if (!resp.ok) throw new Error(`github ${repo} ${resp.status}`)
    const rels = await resp.json()
    if (!Array.isArray(rels)) throw new Error(`github ${repo} bad payload`)
    for (const rel of rels) for (const a of rel.assets || []) total += a.download_count || 0
  }
  return total
}

// Return {total, todayDelta} for app downloads. `total` is the cached (<=1h old)
// GitHub sum; `todayDelta` is how much it has grown since the first read of the
// current Tehran day, so "today" stays the same quantity as the total.
async function githubDownloads(db, day, now) {
  let cur = null
  const cached = await db.prepare("SELECT v, ts FROM meta WHERE k = 'gh_downloads'").first()
  if (cached && now - Number(cached.ts) < GH_CACHE_TTL_MS) {
    cur = Number(cached.v)
  } else {
    try {
      cur = await fetchGithubDownloads()
      await db
        .prepare(
          "INSERT INTO meta(k,v,ts) VALUES('gh_downloads',?1,?2) ON CONFLICT(k) DO UPDATE SET v=?1, ts=?2"
        )
        .bind(String(cur), now)
        .run()
    } catch {
      cur = cached ? Number(cached.v) : 0 // stale-but-present beats breaking the tile
    }
  }
  // Day-start snapshot: written once per Tehran day, on the first read that day.
  const dayKey = 'gh_dstart_' + day
  await db
    .prepare('INSERT OR IGNORE INTO meta(k,v,ts) VALUES(?1,?2,?3)')
    .bind(dayKey, String(cur), now)
    .run()
  const dstartRow = await db.prepare('SELECT v FROM meta WHERE k = ?1').bind(dayKey).first()
  const dstart = dstartRow ? Number(dstartRow.v) : cur
  return { total: cur, todayDelta: Math.max(0, cur - dstart) }
}

// Iran dropped daylight saving in 2022, so the offset is a fixed +3:30 year-round.
const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000

function tehranDay(now = Date.now()) {
  return new Date(now + TEHRAN_OFFSET_MS).toISOString().slice(0, 10) // YYYY-MM-DD
}

// Read both totals and today's counts in a single round trip, then fold the app
// downloads + historical bot baseline into the installs figure.
async function readStats(db, day, now) {
  const rows = await db
    .prepare(
      `SELECT kind,
              SUM(count)                                AS total,
              SUM(CASE WHEN day = ?1 THEN count ELSE 0 END) AS today
         FROM stat_daily
        WHERE kind IN ('visit','install')
        GROUP BY kind`
    )
    .bind(day)
    .all()

  const out = {
    visits: { total: 0, today: 0 },
    installs: { total: 0, today: 0 },
  }
  for (const r of rows.results || []) {
    const bucket = r.kind === 'install' ? out.installs : out.visits
    bucket.total = Number(r.total) || 0
    bucket.today = Number(r.today) || 0
  }

  // Installs = live panel deploys + historical bot deploys + live app downloads.
  const gh = await githubDownloads(db, day, now)
  out.installs.total += INSTALL_BASELINE + gh.total
  out.installs.today += gh.todayDelta

  return { ...out, day }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function onRequestGet(context) {
  const db = context.env.nova_stats
  if (!db) return json({ error: 'stats db not bound' }, 503)
  try {
    const now = Date.now()
    return json(await readStats(db, tehranDay(now), now))
  } catch (e) {
    return json({ error: 'read failed: ' + ((e && e.message) || e) }, 500)
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const db = env.nova_stats
  if (!db) return json({ error: 'stats db not bound' }, 503)

  let body = {}
  try {
    body = await request.json()
  } catch {
    /* empty/invalid body → handled below */
  }

  const type = body && body.type
  if (type !== 'visit' && type !== 'install') {
    return json({ error: "type must be 'visit' or 'install'" }, 400)
  }

  const now = Date.now()
  const day = tehranDay(now)
  try {
    if (type === 'install') {
      // A deploy only counts if we haven't seen this panel before. `INSERT OR
      // IGNORE` + changes() gives us dedupe without a separate SELECT race.
      const id = String((body && body.id) || '').slice(0, 200)
      if (!id) return json({ error: 'install hit requires an id' }, 400)
      const seen = await db
        .prepare('INSERT OR IGNORE INTO install_seen (id, ts) VALUES (?1, ?2)')
        .bind(id, Date.now())
        .run()
      const isNew = (seen.meta && seen.meta.changes) > 0
      if (isNew) {
        await db
          .prepare(
            `INSERT INTO stat_daily (kind, day, count) VALUES ('install', ?1, 1)
             ON CONFLICT(kind, day) DO UPDATE SET count = count + 1`
          )
          .bind(day)
          .run()
      }
      return json({ ...(await readStats(db, day, now)), counted: isNew })
    }

    // Visits: client dedupes once per session, so just bump the counter.
    await db
      .prepare(
        `INSERT INTO stat_daily (kind, day, count) VALUES ('visit', ?1, 1)
         ON CONFLICT(kind, day) DO UPDATE SET count = count + 1`
      )
      .bind(day)
      .run()
    return json({ ...(await readStats(db, day, now)), counted: true })
  } catch (e) {
    return json({ error: 'write failed: ' + ((e && e.message) || e) }, 500)
  }
}
