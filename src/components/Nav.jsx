import Icon from './Icon.jsx'
import { LangSwitch, ThemeToggle } from './Controls.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

const GITHUB = 'https://github.com/IRNova'

export function Logo({ brand }) {
  return (
    <span className="logo">
      <svg viewBox="0 0 100 100" width="30" height="30" aria-hidden="true">
        <path
          d="M 28 22 L 28 64 A 13 13 0 0 0 54 64 L 54 36 A 13 13 0 0 1 80 36 L 80 78"
          fill="none"
          stroke="url(#lg)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="logo-text">{brand}</span>
    </span>
  )
}

// Shared site header — used on the landing page and every sub-page so the
// navigation is consistent everywhere. In-page anchors (#projects, #about…)
// route back to the home page and scroll; #/guide and #/tools are sub-pages.
export default function Nav() {
  const { t } = useLang()
  return (
    <header className="nav">
      <a className="brand-link" href="#/">
        <Logo brand={t.brand} />
      </a>
      <nav className="nav-links">
        <a href="#projects">{t.nav.projects}</a>
        <a href="#capabilities">{t.nav.capabilities}</a>
        <a href="#/guide">{t.nav.guide}</a>
        <a href="#/tools">{t.nav.tools}</a>
        <a href="#about">{t.nav.about}</a>
        <ThemeToggle />
        <LangSwitch />
        <a className="nav-cta" href={GITHUB} target="_blank" rel="noreferrer noopener">
          <Icon name="github" size={18} /> {t.nav.github}
        </a>
      </nav>
    </header>
  )
}
