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

// Iran dropped daylight saving in 2022, so the offset is a fixed +3:30 year-round.
const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000

function tehranDay(now = Date.now()) {
  return new Date(now + TEHRAN_OFFSET_MS).toISOString().slice(0, 10) // YYYY-MM-DD
}

// Read both totals and today's counts in a single round trip.
async function readStats(db, day) {
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
    return json(await readStats(db, tehranDay()))
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

  const day = tehranDay()
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
      return json({ ...(await readStats(db, day)), counted: isNew })
    }

    // Visits: client dedupes once per session, so just bump the counter.
    await db
      .prepare(
        `INSERT INTO stat_daily (kind, day, count) VALUES ('visit', ?1, 1)
         ON CONFLICT(kind, day) DO UPDATE SET count = count + 1`
      )
      .bind(day)
      .run()
    return json({ ...(await readStats(db, day)), counted: true })
  } catch (e) {
    return json({ error: 'write failed: ' + ((e && e.message) || e) }, 500)
  }
}
