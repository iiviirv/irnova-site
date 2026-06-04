import { useEffect, useState } from 'react'
import NetworkBackground from './components/NetworkBackground.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import Guide from './components/Guide.jsx'
import IPTools from './components/IPTools.jsx'
import Icon from './components/Icon.jsx'
import Nav, { Logo } from './components/Nav.jsx'
import { projects, capabilities } from './data/projects.js'
import { useLang } from './i18n/LanguageContext.jsx'

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
const YOUTUBE = 'https://www.youtube.com/watch?v=NGywxMUPtio'

export default function App() {
  const { t, lang } = useLang()
  const route = useHashRoute()

  // Scroll to top whenever we enter a sub-page view.
  useEffect(() => {
    if (route === '#/guide' || route === '#/tools') window.scrollTo(0, 0)
  }, [route])

  if (route === '#/guide') return <Guide />
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
              <a className="btn btn-primary" href="#/guide">
                <Icon name="book" size={18} /> {t.hero.guide}
              </a>
              <a className="btn btn-ghost" href="#projects">
                {t.hero.explore} <Icon name="arrow" size={18} className="icon-arrow" />
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
        </section>
      </main>

      <footer className="footer">
        <Logo brand={t.brand} />
        <p className="footer-note">{t.footer.note}</p>
        <div className="footer-links">
          <a href="#projects">{t.nav.projects}</a>
          <a href="#capabilities">{t.nav.capabilities}</a>
          <a href="#/guide">{t.nav.guide}</a>
          <a href="#/tools">{t.nav.tools}</a>
          <a href={GITHUB} target="_blank" rel="noreferrer noopener">
            {t.nav.github}
          </a>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} Nova Proxy</span>
      </footer>
    </div>
  )
}
