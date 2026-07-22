import { useEffect, useMemo, useState } from 'react'
import NetworkBackground from './components/NetworkBackground.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import IPTools from './components/IPTools.jsx'
import Icon from './components/Icon.jsx'
import Nav, { Logo } from './components/Nav.jsx'
import { projects, capabilities, team, clients, clientReleasesUrl } from './data/projects.js'
import { useLang } from './i18n/LanguageContext.jsx'
import novaMark from './assets/nova-mark.png'
import installerCover from './assets/nova-server-installer.png'

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

// Best-effort guess of the visitor's platform so we can surface the right Nova
// download first. Prefers the modern userAgentData.platform, falls back to the
// legacy navigator.platform / userAgent. Returns a client key ('android',
// 'windows', 'macos', 'ios') or null when we can't tell (Linux, bots, locked-down
// browsers), in which case the UI just shows every platform with no highlight.
function detectPlatform() {
  if (typeof navigator === 'undefined') return null
  const plat = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase()
  const ua = (navigator.userAgent || '').toLowerCase()
  const touch = navigator.maxTouchPoints || 0
  // iPadOS 13+ reports itself as a Mac, so a touch-capable "Mac" is really an iPad.
  if (/iphone|ipad|ipod/.test(ua) || /ios/.test(plat) || (plat.includes('mac') && touch > 1)) {
    return 'ios'
  }
  if (/android/.test(ua) || plat.includes('android')) return 'android'
  if (plat.includes('win') || /windows/.test(ua)) return 'windows'
  if (plat.includes('mac') || /mac os/.test(ua)) return 'macos'
  return null
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
const NOVA_PROXY_REPO = 'https://github.com/IRNova/Nova-Proxy'
const NOVA_SERVER_REPO = 'https://github.com/IRNova/Nova-Server'
// The dedicated Nova Server (VPS) repo: bilingual setup docs plus the one-line installer.
const VPS_GUIDE_URL = NOVA_SERVER_REPO
// The Telegram installer bot that sets up a Nova Server node for people with no
// computer (paste a script, guided, or fully automatic over SSH).
const INSTALLER_BOT = 'https://t.me/NovaServerInstaller_Bot'
// Icons for the eight Nova Server feature-family cards, matched to the group order
// in translations.js (novaServer.groups). Kept here so the copy stays icon-free.
const NS_GROUP_ICONS = ['route', 'link', 'gauge', 'shield', 'globe', 'dns', 'bolt', 'book']

// The exact one-line installer users run on their own server. Kept verbatim, no
// sudo, no wrapping. Shared by the copy button in the "Connect your VPS" card.
const VPS_INSTALL_CMD =
  'bash <(curl -fsSL https://raw.githubusercontent.com/IRNova/Nova-Server/main/nova-node.sh)'

// Copy-to-clipboard command block for the VPS card. Kept LTR on the box itself so
// the command never reverses under RTL, while the label above follows the page
// direction. Success feedback swaps the icon to a check for ~1.5s.
function VpsCommand({ copy }) {
  const [copied, setCopied] = useState(false)
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(VPS_INSTALL_CMD)
    } catch {
      /* clipboard may be blocked (insecure context / permissions) */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="vps-cmd">
      <span className="vps-cmd-label">{copy.cmdLabel}</span>
      <div className="vps-cmd-box" dir="ltr">
        <code className="vps-cmd-code">{VPS_INSTALL_CMD}</code>
        <button
          type="button"
          className="mini-btn vps-cmd-copy"
          onClick={onCopy}
          aria-label={copied ? copy.copied : copy.copy}
        >
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          <span>{copied ? copy.copied : copy.copy}</span>
        </button>
      </div>
    </div>
  )
}

// Dedicated flagship showcase for Nova Server, the self-hosted big brother of
// Nova Proxy. Reuses the existing VpsCommand (same one-line installer as the
// deploy section) plus the site's card/eyebrow/pill vocabulary, so it reads as
// native to the page. Feature-heavy content is grouped into eight family cards
// instead of a long wall of one-liners.
function NovaServerSection({ ns }) {
  return (
    <section id="nova-server" className="section ns-section">
      {/* Flagship intro: copy + one-line installer on the left, at-a-glance spec
          card on the right. */}
      <div className="ns-hero">
        <div className="ns-hero-copy">
          <div className="ns-eyebrow-row">
            <span className="eyebrow">{ns.eyebrow}</span>
            <span className="ns-flag">
              <Icon name="star" size={13} /> {ns.flagship}
            </span>
          </div>
          <h2 className="ns-title">
            {ns.title}
            <span className="grad"> {ns.titleAccent}</span>
          </h2>
          <p className="ns-intro">{ns.intro}</p>

          <VpsCommand copy={ns.cmd} />

          <div className="ns-cta-row">
            <a
              className="btn btn-primary"
              href={INSTALLER_BOT}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="bot" size={18} /> {ns.botCta}
            </a>
            <a
              className="btn btn-ghost"
              href={NOVA_SERVER_REPO}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="github" size={18} /> {ns.githubCta}
            </a>
          </div>
        </div>

        <aside className="ns-spec" aria-label={ns.eyebrow}>
          <div className="ns-spec-head">
            <img className="ns-spec-mark" src={novaMark} width="34" height="34" alt="" aria-hidden="true" />
            <div className="ns-spec-heading">
              <strong>{ns.eyebrow}</strong>
              <span>{ns.specSub}</span>
            </div>
          </div>
          <ul className="ns-spec-list">
            {ns.specs.map((s) => (
              <li key={s.k}>
                <span className="ns-spec-k">{s.k}</span>
                <span className="ns-spec-v">{s.v}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Grouped feature families: protocols and transports as chip clusters,
          the rest as short check-lists. */}
      <div className="section-head ns-features-head">
        <span className="eyebrow">{ns.featuresEyebrow}</span>
        <h2>{ns.featuresTitle}</h2>
        <p>{ns.featuresDesc}</p>
      </div>
      <div className="ns-group-grid">
        {ns.groups.map((g, i) => (
          <article className="ns-group" key={g.title}>
            <div className="ns-group-head">
              <span className="cap-icon">
                <Icon name={NS_GROUP_ICONS[i]} size={20} />
              </span>
              <div className="ns-group-heading">
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
              </div>
            </div>
            {g.chips ? (
              <div className="ns-chips">
                {g.chips.map((c) => (
                  <span className="ns-chip" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <ul className="ns-list">
                {g.items.map((it, j) => (
                  <li key={j}>
                    <Icon name="check" size={14} /> {it}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {/* Telegram installer highlight: banner image + the three install paths. */}
      <div className="ns-installer">
        <div className="ns-installer-media">
          <img
            src={installerCover}
            alt={ns.installer.imageAlt}
            width="1280"
            height="640"
            loading="lazy"
          />
        </div>
        <div className="ns-installer-copy">
          <span className="eyebrow ns-installer-eyebrow">
            <Icon name="telegram" size={14} /> {ns.installer.eyebrow}
          </span>
          <h3>{ns.installer.title}</h3>
          <p className="ns-installer-desc">{ns.installer.desc}</p>

          <span className="ns-methods-label">{ns.installer.methodsLabel}</span>
          <ol className="ns-methods">
            {ns.installer.methods.map((m, i) => (
              <li key={m.title}>
                <span className="ns-method-num">{i + 1}</span>
                <div className="ns-method-text">
                  <strong>{m.title}</strong>
                  <span>{m.text}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className="ns-cta-row ns-installer-cta">
            <a
              className="btn btn-primary"
              href={INSTALLER_BOT}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="bot" size={18} /> {ns.installer.botCta}
            </a>
            <a
              className="ns-bot-handle"
              href={INSTALLER_BOT}
              target="_blank"
              rel="noreferrer noopener"
              dir="ltr"
            >
              {ns.installer.botLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// The exact Cloudflare API token permissions the in-browser installer needs.
// These match Cloudflare's own token-editor wording so users can tick them off
// one-to-one. Names stay in English because that is how the Cloudflare dashboard
// labels them in every locale.
const cfTokenPerms = {
  account: [
    { name: 'Workers Scripts', level: 'edit' },
    { name: 'Workers KV Storage', level: 'edit' },
    { name: 'D1', level: 'edit' },
    { name: 'Account Settings', level: 'read' },
    { name: 'Account Analytics', level: 'read' },
  ],
  zone: [
    { name: 'Zone', level: 'read' },
    { name: 'DNS', level: 'edit' },
    { name: 'SSL and Certificates', level: 'edit' },
    { name: 'Zone Settings', level: 'edit' },
  ],
}

export default function App() {
  const { t, lang } = useLang()
  const route = useHashRoute()
  const live = useSiteStats()

  // Detect the platform once, then float the matching download to the front of the
  // grid. Everything stays visible and downloadable; detection only reorders and
  // adds a "Recommended for your device" badge. Null result = no reorder, no badge.
  const detectedPlatform = useMemo(() => detectPlatform(), [])
  const orderedClients = useMemo(() => {
    if (!detectedPlatform) return clients
    const match = clients.filter((c) => c.key === detectedPlatform)
    if (match.length === 0) return clients
    return [...match, ...clients.filter((c) => c.key !== detectedPlatform)]
  }, [detectedPlatform])

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

        <NovaServerSection ns={t.novaServer} />

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

        <section id="deploy" className="section section-alt">
          <div className="section-head">
            <span className="eyebrow">{t.access.eyebrow}</span>
            <h2>{t.access.title}</h2>
            <p>{t.access.desc}</p>
          </div>

          {/* Recommended path: one-click Worker deploy, with the token checklist. */}
          <article className="access-card is-featured">
            <div className="access-head">
              <span className="access-icon">
                <Icon name="bolt" size={22} />
              </span>
              <div className="access-headings">
                <span className="access-rec">{t.access.recommended}</span>
                <h3>{t.access.panel.title}</h3>
                <p className="access-tagline">{t.access.panel.tagline}</p>
              </div>
            </div>
            <p className="access-desc">{t.access.panel.desc}</p>

            <div className="access-need">
              <span className="access-need-label">{t.access.panel.needLabel}</span>
              <ul>
                {t.access.panel.need.map((item, i) => (
                  <li key={i}>
                    <Icon name="check" size={15} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="token-check">
              <div className="token-check-head">
                <Icon name="key" size={18} />
                <div>
                  <strong>{t.access.panel.tokenLabel}</strong>
                  <span>{t.access.panel.tokenNote}</span>
                </div>
              </div>
              <div className="token-groups">
                {['account', 'zone'].map((scope) => (
                  <div className="token-group" key={scope}>
                    <span className="token-group-title">
                      {scope === 'account' ? 'Account' : 'Zone'}
                    </span>
                    <ul>
                      {cfTokenPerms[scope].map((p) => (
                        <li key={p.name}>
                          <Icon name="check" size={14} />
                          <span className="token-name">{p.name}</span>
                          <span className={`token-level ${p.level}`}>
                            {p.level === 'edit' ? 'Edit' : 'Read'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="access-actions">
              <a className="btn btn-primary" href={INSTALLER_URL}>
                <Icon name="bolt" size={18} /> {t.access.panel.deployCta}
              </a>
              <a
                className="btn btn-ghost"
                href={NOVA_PROXY_REPO}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="github" size={18} /> {t.access.panel.repoCta}
              </a>
            </div>
          </article>

          {/* Secondary paths: bring your own VPS, or reuse an existing link. */}
          <div className="access-grid">
            <article className="access-card">
              <div className="access-head">
                <span className="access-icon">
                  <Icon name="route" size={22} />
                </span>
                <div className="access-headings">
                  <h3>{t.access.vps.title}</h3>
                  <p className="access-tagline">{t.access.vps.tagline}</p>
                </div>
              </div>
              <p className="access-desc">{t.access.vps.desc}</p>

              <div className="access-callout">
                <Icon name="phone" size={18} />
                <div>
                  <strong>{t.access.vps.domainTitle}</strong>
                  <span>{t.access.vps.domainText}</span>
                </div>
              </div>

              <div className="access-need">
                <span className="access-need-label">{t.access.vps.needLabel}</span>
                <ul>
                  {t.access.vps.need.map((item, i) => (
                    <li key={i}>
                      <Icon name="check" size={15} /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <VpsCommand copy={t.access.vps} />

              <div className="access-actions">
                <a
                  className="btn btn-ghost"
                  href={VPS_GUIDE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="book" size={18} /> {t.access.vps.cta}
                </a>
              </div>
            </article>

            <article className="access-card">
              <div className="access-head">
                <span className="access-icon">
                  <Icon name="link" size={22} />
                </span>
                <div className="access-headings">
                  <h3>{t.access.sub.title}</h3>
                  <p className="access-tagline">{t.access.sub.tagline}</p>
                </div>
              </div>
              <p className="access-desc">{t.access.sub.desc}</p>

              <div className="access-need">
                <span className="access-need-label">{t.access.sub.needLabel}</span>
                <ul>
                  {t.access.sub.need.map((item, i) => (
                    <li key={i}>
                      <Icon name="check" size={15} /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="access-actions">
                <a className="btn btn-primary" href="#clients">
                  <Icon name="download" size={18} /> {t.access.sub.cta}
                </a>
              </div>
            </article>
          </div>
        </section>

        <section id="clients" className="section">
          <div className="section-head">
            <span className="eyebrow">{t.clientsSection.eyebrow}</span>
            <h2>{t.clientsSection.title}</h2>
            <p>{t.clientsSection.desc}</p>
          </div>
          <div className="client-grid">
            {orderedClients.map((c) => {
              const recommended = c.key === detectedPlatform
              const ctaLabel = c.ctaKey ? t.clientsSection[c.ctaKey] : t.clientsSection.download
              return (
                <article
                  className={recommended ? 'client-card is-recommended' : 'client-card'}
                  key={c.key}
                >
                  <div className="client-card-top">
                    <span className="cap-icon">
                      <Icon name={c.icon} size={24} />
                    </span>
                    {recommended && (
                      <span className="client-rec">
                        <Icon name="check" size={13} /> {t.clientsSection.recommended}
                      </span>
                    )}
                  </div>
                  <h3>{c.name[lang]}</h3>
                  <p>{c.detail[lang]}</p>

                  <a
                    className="btn btn-primary client-btn"
                    href={c.url}
                    target={c.external ? '_blank' : undefined}
                    rel="noreferrer noopener"
                  >
                    <Icon name={c.external ? 'open' : 'download'} size={16} /> {ctaLabel}
                  </a>

                  {c.caveat && (
                    <p className="client-caveat">
                      <Icon name="shield" size={14} /> {c.caveat[lang]}
                    </p>
                  )}

                  {c.steps && (
                    <details className="client-steps">
                      <summary>
                        <span>{t.clientsSection.howToInstall}</span>
                        <Icon name="chevron" size={16} className="client-steps-caret" />
                      </summary>
                      <ol>
                        {c.steps[lang].map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </details>
                  )}
                </article>
              )
            })}
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
            <a className="tg-banner ig-banner" href={INSTAGRAM} target="_blank" rel="noreferrer noopener">
              <span className="tg-icon ig-icon">
                <Icon name="instagram" size={26} />
              </span>
              <span className="tg-text">
                <strong>{t.instagram.title}</strong>
                <span>{t.instagram.text}</span>
              </span>
              <span className="btn ig-cta">{t.instagram.cta}</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Logo brand={t.brand} />
        <p className="footer-note">{t.footer.note}</p>
        <div className="footer-links">
          <a href="#projects">{t.nav.projects}</a>
          <a href="#nova-server">{t.nav.server}</a>
          <a href="#capabilities">{t.nav.capabilities}</a>
          <a href="#clients">{t.nav.apps}</a>
          <a href="#deploy">{t.nav.deploy}</a>
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
