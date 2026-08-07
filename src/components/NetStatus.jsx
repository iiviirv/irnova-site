import { useEffect, useState } from 'react'
import Icon from './Icon'
import { useLang } from '../i18n/LanguageContext'

// Point this at the local Nova Net dev server to preview the card before the
// subdomain exists:  VITE_NET_URL=http://localhost:8788 npm run dev
export const NET_URL = import.meta.env.VITE_NET_URL || 'https://net.novaproxy.online'

// Live reachability summary from Nova Net. The endpoint is CORS-open and
// edge-cached for a minute, so this is one cheap request per visitor.
// If it fails (the subdomain itself can be filtered, which is rather the point
// of the project) the whole section simply does not render - a broken card on
// the landing page would be worse than no card.
function useNetStatus() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6000)
    fetch(`${NET_URL}/api/summary`, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        // Render as soon as the endpoint answers. percent_ir may still be null
        // when no probe inside Iran has reported yet; that case gets an honest
        // waiting state rather than a fabricated number, and rather than the
        // whole section vanishing and leaving the nav link pointing at nothing.
        if (alive && j && j.ok) setData(j)
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer))
    return () => {
      alive = false
      ctrl.abort()
    }
  }, [])
  return data
}

function fmtNum(n, lang) {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n)
}

function relTime(ts, lang) {
  const secs = Math.max(0, Math.floor(Date.now() / 1000) - ts)
  const rtf = new Intl.RelativeTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { numeric: 'auto' })
  if (secs < 90) return rtf.format(-secs, 'second')
  if (secs < 5400) return rtf.format(-Math.round(secs / 60), 'minute')
  return rtf.format(-Math.round(secs / 3600), 'hour')
}

export default function NetStatus() {
  const { lang, t } = useLang()
  const data = useNetStatus()
  if (!data) return null

  const s = t.netStatus
  const pct = data.percent_ir
  const waiting = typeof pct !== 'number'
  const tone = waiting ? 'idle' : pct >= 90 ? 'ok' : pct >= 50 ? 'warn' : 'bad'
  const blocked = data.blocked_in_iran || 0

  return (
    <section id="net-status" className="section net-status">
      <div className="section-head">
        <span className="eyebrow">{s.eyebrow}</span>
        <h2>{s.title}</h2>
        <p>{s.desc}</p>
      </div>

      <div className="net-card">
        <div className={`net-gauge net-${tone}`}>
          <span className="net-pct">{waiting ? '-' : `${fmtNum(pct, lang)}%`}</span>
          <span className="net-pct-label">{waiting ? s.waiting : s.reachable}</span>
        </div>

        <div className="net-body">
          <div className="net-figures">
            <div className="net-fig">
              <span className="net-fig-v">{waiting ? '-' : fmtNum(blocked, lang)}</span>
              <span className="net-fig-l">{s.blocked}</span>
            </div>
            <div className="net-fig">
              <span className="net-fig-v">{fmtNum(data.total || 0, lang)}</span>
              <span className="net-fig-l">{s.checked}</span>
            </div>
            <div className="net-fig">
              <span className="net-fig-v">{fmtNum(data.percent_fg ?? 0, lang)}%</span>
              <span className="net-fig-l">{s.abroad}</span>
            </div>
          </div>

          {waiting && <p className="net-waiting">{s.waitingNote}</p>}

          {data.blocked?.length > 0 && (
            <ul className="net-list">
              {data.blocked.slice(0, 8).map((b) => (
                <li key={b.host}>{b.name}</li>
              ))}
            </ul>
          )}

          <div className="net-foot">
            <a className="btn btn-primary" href={NET_URL} target="_blank" rel="noreferrer noopener">
              <Icon name="bolt" size={18} /> {s.cta}
            </a>
            {data.updated ? (
              <span className="net-updated">
                {s.updated} {relTime(data.updated, lang)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
