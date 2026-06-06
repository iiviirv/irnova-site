import { useEffect, useState } from 'react'
import NetworkBackground from './components/NetworkBackground.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import Guide from './components/Guide.jsx'
import IPTools from './components/IPTools.jsx'
import Icon from './components/Icon.jsx'
import Nav, { Logo } from './components/Nav.jsx'
import { projects, capabilities, team } from './data/projects.js'
import { useLang } from './i18n/LanguageContext.jsx'
import { useLatestRelease, RELEASES_PAGE } from './hooks/useLatestRelease.js'

// Tiny hash router: '#/guide' shows the setup guide, everything else (including
// in-page anchors like '#projects') shows the landing page.
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

const GITHUB = 'https://github.com/IRNova'
const TELEGRAM = 'https://t.me/irnova_proxy'
const YOUTUBE = 'https://youtube.com/@novaproxyir'
const X = 'https://x.com/irNovaProxy'

export default function App() {
  const { t, lang } = useLang()
  const route = useHashRoute()
  const release = useLatestRelease()

  // Scroll to top whenever we enter a sub-page view.
  useEffect(() => {
    if (route === '#/guide' || route === '#/tools' || route === '#/deploy') {
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

  if (route === '#/guide' || route === '#/deploy') return <Guide />
  if (route === '#/tools') return <IPTools />

  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0)
  const stats = [
    { value: `${(totalStars / 1000).toFixed(1)}k+`, label: t.stats.stars },
    { value: projects.length, label: t.stats.projects },
    { value: 'Go · React', label: t.stats.builtWith },
    { value: '100%', label: t.stats.openSource },
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
              <a className="btn btn-primary" href="#deploy">
                <Icon name="bolt" size={18} /> {t.hero.deployCta}
              </a>
              <a className="btn btn-ghost" href="#/guide">
                <Icon name="book" size={18} /> {t.hero.guide}
              </a>
              <a className="btn btn-ghost" href={GITHUB} target="_blank" rel="noreferrer noopener">
                <Icon name="github" size={18} /> {t.hero.follow}
              </a>
            </div>
            <div className="stats">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
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

        <section id="deploy" className="section">
          <div className="section-head">
            <span className="eyebrow">{t.deploy.eyebrow}</span>
            <h2>
              {t.deploy.title} <span className="grad">{t.deploy.titleAccent}</span>
            </h2>
            <p>{t.deploy.sub}</p>
          </div>

          <div className="deploy-cta-row">
            <a
              className="btn btn-primary deploy-hero-btn"
              href={release.jsUrl || release.pageUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="bolt" size={18} /> {t.deploy.cta}
              {release.version ? <span className="deploy-ver">{release.version}</span> : null}
            </a>
            <a className="btn btn-ghost" href="#/guide">
              <Icon name="book" size={18} /> {t.nav.guide}
            </a>
          </div>
          <p className="deploy-release-note">
            {t.deploy.releaseNote}{' '}
            <a href={RELEASES_PAGE} target="_blank" rel="noreferrer noopener">
              {t.deploy.allReleases}
            </a>
          </p>

          <ol className="deploy-steps">
            {t.deploy.steps.map((s, i) => (
              <li key={i}>
                <span className="deploy-num">{i + 1}</span>
                <span className="deploy-step-text">
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="note note-warn deploy-iran-note">
            <span className="note-dot" />
            <span>
              <strong>{t.deploy.iranNoteTitle}</strong> {t.deploy.iranNote}
            </span>
          </div>

          <div className="deploy-links">
            <a href={GITHUB + '/Nova-Proxy'} target="_blank" rel="noreferrer noopener">
              <Icon name="github" size={16} /> {t.deploy.repoCta}
            </a>
            <a href={TELEGRAM} target="_blank" rel="noreferrer noopener">
              <Icon name="telegram" size={16} /> {t.deploy.tgCta}
            </a>
          </div>
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
          <a href="#deploy">{t.nav.deploy}</a>
          <a href="#team">{t.teamSection.title}</a>
          <a href="#/guide">{t.nav.guide}</a>
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
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} Nova Proxy</span>
      </footer>
    </div>
  )
}
