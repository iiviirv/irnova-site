import { useState } from 'react'
import Icon from './Icon.jsx'
import { LangSwitch, ThemeToggle } from './Controls.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

const GITHUB = 'https://github.com/IRNova'
const TELEGRAM = 'https://t.me/irnova_proxy'
const YOUTUBE = 'https://youtube.com/@novaproxyir'

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

// Shared site header — consistent on every page. On mobile the links collapse
// into a hamburger menu. In-page anchors (#projects, #about…) route back to the
// home page and scroll; #/guide and #/tools are sub-pages.
export default function Nav() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <div className="topbar">
        <span className="topbar-text">{t.social.follow}</span>
        <a className="topbar-link tg" href={TELEGRAM} target="_blank" rel="noreferrer noopener">
          <Icon name="telegram" size={15} /> Telegram
        </a>
        <a className="topbar-link yt" href={YOUTUBE} target="_blank" rel="noreferrer noopener">
          <Icon name="youtube" size={15} /> YouTube
        </a>
      </div>
      <header className="nav">
        <a className="brand-link" href="#/" onClick={close}>
        <Logo brand={t.brand} />
      </a>

      <nav className={`nav-links${open ? ' open' : ''}`}>
        <a href="#projects" onClick={close}>
          {t.nav.projects}
        </a>
        <a href="#capabilities" onClick={close}>
          {t.nav.capabilities}
        </a>
        <a href="#deploy" onClick={close}>
          {t.nav.deploy}
        </a>
        <a href="#/guide" onClick={close}>
          {t.nav.guide}
        </a>
        <a href="#/tools" onClick={close}>
          {t.nav.tools}
        </a>
        <a href="#about" onClick={close}>
          {t.nav.about}
        </a>
        <a
          className="nav-cta"
          href={GITHUB}
          target="_blank"
          rel="noreferrer noopener"
          onClick={close}
        >
          <Icon name="github" size={18} /> {t.nav.github}
        </a>
      </nav>

      <div className="nav-actions">
        <ThemeToggle />
        <LangSwitch />
        <button
          type="button"
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>
      </header>
    </>
  )
}
