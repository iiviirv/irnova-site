import { useEffect, useState } from 'react'
import NetworkBackground from './components/NetworkBackground.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import IPTools from './components/IPTools.jsx'
import Icon from './components/Icon.jsx'
import Nav, { Logo } from './components/Nav.jsx'
import { projects, capabilities, team, clients, clientReleasesUrl } from './data/projects.js'
import { useLang } from './i18n/LanguageContext.jsx'

// Tiny hash router: '#/tools' shows the IP tools sub-page, everything else
// (including in-page anchors like '#projects') shows the landing page.
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

// Live visit + install counters from the /api/stats Pages Function. On the first
// load of a browser session we POST a visit (which returns the fresh numbers);
// after that we just GET, so a reload or hash navigation never re-counts. If the
// endpoint is unreachable (e.g. filtered), we simply keep the placeholder dashes.
function useSiteStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let alive = true
    const counted = (() => {
      try {
        return sessionStorage.getItem('nova-visit-counted') === '1'
      } catch {
        return false
      }
    })()
    const req = counted
      ? fetch('/api/stats', { headers: { Accept: 'application/json' } })
      : fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'visit' }),
        })
    req
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !alive) return
        setStats(data)
        try {
          sessionStorage.setItem('nova-visit-counted', '1')
        } catch {
          /* private mode — no big deal, worst case we count one extra visit */
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return stats
}

// Compact, locale-aware number: 12345 → "12.3k", 812 → "812" (or Persian digits).
function fmtCount(n, lang) {
  const locale = lang === 'fa' ? 'fa-IR' : 'en-US'
  if (n == null) return '—'
  if (n >= 10000) {
    return (n / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }) + 'k'
  }
  return n.toLocaleString(locale)
}

const GITHUB = 'https://github.com/IRNova'
const TELEGRAM = 'https://t.me/irnova_proxy'
const YOUTUBE = 'https://youtube.com/@novaproxyir'
const X = 'https://x.com/irNovaProxy'
const INSTAGRAM = 'https://instagram.com/irnova_proxy'
// In-browser auto-installer (public/install.html): the visitor pastes one
// Cloudflare API token and the page builds the Worker + D1/KV on their own
// account. This is now the single deploy entry point for the whole site.
const INSTALLER_URL = './install.html'

export default function App() {
  const { t, lang } = useLang()
  const route = useHashRoute()
  const live = useSiteStats()

  // Scroll to top whenever we enter a sub-page view.
  useEffect(() => {
    if (route === '#/tools') {
      window.scrollTo(0, 0)
    } else if (route && route.length > 1 && route.startsWith('#') && !route.startsWith('#/')) {
      // In-page anchor (e.g. #projects) clicked from a sub-page: the landing page
      // has just mounted, so scroll to the target after it paints.
      const id = route.slice(1)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    }
  }, [route])

  if (route === '#/tools') return <IPTools />

  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0)
  // Live tiles show total up top with today's gain underneath. Until /api/stats
  // answers they show a dash, so the grid never jumps.
  const todayLine = (n) =>
    live && n > 0 ? `+${fmtCount(n, lang)} ${t.stats.today}` : ''
  const stats = [
    { key: 'visits', value: fmtCount(live?.visits.total, lang), label: t.stats.visits, live: true, sub: todayLine(live?.visits.today) },
    { key: 'installs', value: fmtCount(live?.installs.total, lang), label: t.stats.installs, live: true, sub: todayLine(live?.installs.today) },
    { key: 'stars', value: `${(totalStars / 1000).toFixed(1)}k+`, label: t.stats.stars },
    { key: 'projects', value: projects.length, label: t.stats.projects },
    { key: 'builtWith', value: 'Go · React', label: t.stats.builtWith },
    { key: 'openSource', value: '100%', label: t.stats.openSource },
  ]

  return (
    <div className="app">
      <Nav />

      <main>
        <section className="hero">
          <NetworkBackground />
          <div className="hero-inner">
            <span className="pill">{t.hero.pill}</span>
            <h1>
              {t.hero.titleLine1}
              <span className="grad"> {t.hero.titleAccent}</span>
            </h1>
            <p className="hero-sub">{t.hero.sub}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={INSTALLER_URL}>
                <Icon name="bolt" size={18} /> {t.hero.deployCta}
              </a>
              <a className="btn btn-ghost" href="#projects">
                <Icon name="app" size={18} /> {t.hero.explore}
              </a>
            </div>
            {t.hero.trust && (
              <div className="hero-trust">
                {t.hero.trust.map((item, i) => (
                  <span key={i}>
                    <Icon name="check" size={14} /> {item}
                  </span>
                ))}
              </div>
            )}
            <div className="stats">
              {stats.map((s) => (
                <div className={s.live ? 'stat live' : 'stat'} key={s.key}>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                  {s.live && <span className="stat-sub">{s.sub}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-head">
            <span className="eyebrow">{t.projectsSection.eyebrow}</span>
            <h2>{t.projectsSection.title}</h2>
            <p>{t.projectsSection.desc}</p>
          </div>
          <div className="project-grid">
            {projects.map((p) => (
              <ProjectCard key={p.name} project={p} />
            ))}
          </div>
        </section>

        <section id="capabilities" className="section section-alt">
          <div className="section-head">
            <span className="eyebrow">{t.capsSection.eyebrow}</span>
            <h2>{t.capsSection.title}</h2>
            <p>{t.capsSection.desc}</p>
          </div>
          <div className="cap-grid">
            {capabilities.map((c) => (
              <div className="cap-card" key={c.icon}>
                <span className="cap-icon">
                  <Icon name={c.icon} size={22} />
                </span>
                <h3>{c.title[lang]}</h3>
                <p>{c.text[lang]}</p>
              </div>
            ))}
          </div>
          <p className="platform-note">
            <Icon name="shield" size={16} /> {t.capsSection.note}
          </p>
        </section>

        <section id="clients" className="section">
          <div className="section-head">
            <span className="eyebrow">{t.clientsSection.eyebrow}</span>
            <h2>{t.clientsSection.title}</h2>
            <p>{t.clientsSection.desc}</p>
          </div>
          <div className="client-grid">
            {clients.map((c) =>
              c.available ? (
                <a className="client-card" key={c.key} href={c.url} rel="noreferrer noopener">
                  <span className="cap-icon">
                    <Icon name={c.icon} size={24} />
                  </span>
                  <h3>{c.name[lang]}</h3>
                  <p>{c.detail[lang]}</p>
                  <span className="btn btn-primary client-btn">
                    <Icon name="download" size={16} /> {t.clientsSection.download}
                  </span>
                </a>
              ) : (
                <div className="client-card is-soon" key={c.key}>
                  <span className="cap-icon">
                    <Icon name={c.icon} size={24} />
                  </span>
                  <h3>{c.name[lang]}</h3>
                  <p>{c.detail[lang]}</p>
                  <span className="btn btn-ghost client-btn">{t.clientsSection.comingSoon}</span>
                </div>
              )
            )}
          </div>
          <p className="platform-note">
            <Icon name="link" size={16} /> {t.clientsSection.note}{' '}
            <a href={clientReleasesUrl} target="_blank" rel="noreferrer noopener">
              {t.clientsSection.allReleases}
            </a>
          </p>
        </section>

        <section id="about" className="section">
          <div className="about">
            <div className="about-copy">
              <span className="eyebrow">{t.about.eyebrow}</span>
              <h2>{t.about.title}</h2>
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <a className="btn btn-primary" href={GITHUB} target="_blank" rel="noreferrer noopener">
                <Icon name="github" size={18} /> {t.about.cta}
              </a>
            </div>
            <div className="about-card">
              <div className="about-card-head">
                <Logo brand={t.brand} />
                <a href={GITHUB} target="_blank" rel="noreferrer noopener" className="about-handle">
                  @IRNova
                </a>
              </div>
              <ul className="about-list">
                {t.about.list.map((item, i) => (
                  <li key={i}>
                    <Icon name={['route', 'radar', 'shield', 'open'][i]} size={18} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="team" className="section section-alt">
          <div className="section-head">
            <span className="eyebrow">{t.teamSection.eyebrow}</span>
            <h2>{t.teamSection.title}</h2>
            <p>{t.teamSection.desc}</p>
          </div>
          <div className="team-grid">
            {team.map((m) => (
              <a
                className="team-card"
                key={m.handle}
                href={m.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <img
                  className="team-avatar"
                  src={m.avatar}
                  alt={m.name}
                  width="84"
                  height="84"
                  loading="lazy"
                />
                <span className="team-name">{m.name}</span>
                <span className="team-handle">@{m.handle}</span>
                <span className="team-role">{m.role[lang]}</span>
                <span className="team-link">
                  <Icon name="github" size={15} /> {t.viewOnGithub}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="watch" className="section">
          <div className="section-head">
            <span className="eyebrow">
              <Icon name="youtube" size={14} /> {t.youtube.eyebrow}
            </span>
            <h2>{t.youtube.title}</h2>
            <p>{t.youtube.desc}</p>
          </div>
          <a
            className="yt-card"
            href={YOUTUBE}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t.youtube.label}
          >
            <span className="yt-play">
              <Icon name="play" size={30} />
            </span>
            <span className="yt-label">{t.youtube.label}</span>
            <span className="yt-cta">
              {t.youtube.cta} <Icon name="arrow" size={16} className="icon-arrow" />
            </span>
          </a>
        </section>

        <section className="section tg-section">
          <div className="social-banners">
            <a className="tg-banner" href={TELEGRAM} target="_blank" rel="noreferrer noopener">
              <span className="tg-icon">
                <Icon name="telegram" size={26} />
              </span>
              <span className="tg-text">
                <strong>{t.telegram.title}</strong>
                <span>{t.telegram.text}</span>
              </span>
              <span className="btn btn-primary tg-cta">{t.telegram.cta}</span>
            </a>
            <a className="tg-banner x-banner" href={X} target="_blank" rel="noreferrer noopener">
              <span className="tg-icon x-icon">
                <Icon name="x" size={22} />
              </span>
              <span className="tg-text">
                <strong>{t.x.title}</strong>
                <span>{t.x.text}</span>
              </span>
              <span className="btn x-cta">{t.x.cta}</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Logo brand={t.brand} />
        <p className="footer-note">{t.footer.note}</p>
        <div className="footer-links">
          <a href="#projects">{t.nav.projects}</a>
          <a href="#capabilities">{t.nav.capabilities}</a>
          <a href="#clients">{t.nav.apps}</a>
          <a href={INSTALLER_URL}>{t.nav.deploy}</a>
          <a href="#team">{t.teamSection.title}</a>
          <a href="#/tools">{t.nav.tools}</a>
          <a href={GITHUB} target="_blank" rel="noreferrer noopener">
            {t.nav.github}
          </a>
          <a href={TELEGRAM} target="_blank" rel="noreferrer noopener">
            Telegram
          </a>
          <a href={X} target="_blank" rel="noreferrer noopener">
            X
          </a>
          <a href={YOUTUBE} target="_blank" rel="noreferrer noopener">
            YouTube
          </a>
          <a href={INSTAGRAM} target="_blank" rel="noreferrer noopener">
            Instagram
          </a>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} Nova Proxy</span>
      </footer>
    </div>
  )
}
