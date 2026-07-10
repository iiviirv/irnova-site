import { useState } from 'react'
import Icon from './Icon.jsx'
import { LangSwitch, ThemeToggle } from './Controls.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'
import novaMark from '../assets/nova-mark.png'

const GITHUB = 'https://github.com/IRNova'
const TELEGRAM = 'https://t.me/irnova_proxy'
const YOUTUBE = 'https://youtube.com/@novaproxyir'
const X = 'https://x.com/irNovaProxy'
const INSTAGRAM = 'https://instagram.com/irnova_proxy'

export function Logo({ brand }) {
  return (
    <span className="logo">
      <img className="logo-mark" src={novaMark} width="30" height="30" alt="" aria-hidden="true" />
      <span className="logo-text">{brand}</span>
    </span>
  )
}

// Shared site header — consistent on every page. On mobile the links collapse
// into a hamburger menu. In-page anchors (#projects, #about…) route back to the
// home page and scroll; #/tools is a sub-page and Deploy opens /install.html.
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
        <a className="topbar-link x" href={X} target="_blank" rel="noreferrer noopener">
          <Icon name="x" size={13} /> X
        </a>
        <a className="topbar-link ig" href={INSTAGRAM} target="_blank" rel="noreferrer noopener">
          <Icon name="instagram" size={15} /> Instagram
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
        <a href="#clients" onClick={close}>
          {t.nav.apps}
        </a>
        <a href="./install.html" onClick={close}>
          {t.nav.deploy}
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
