import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { LangSwitch, ThemeToggle } from './Controls.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'
import { guide } from '../i18n/guide.js'

const PROGRESS_KEY = 'nova-guide-progress'
const TRACK_ICON = { panel: 'cloud', connect: 'phone' }

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}
  } catch {
    return {}
  }
}

function CopyButton({ value, copyLabel, copiedLabel }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* clipboard may be blocked; ignore */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button type="button" className="copy-btn" onClick={copy}>
      <Icon name={copied ? 'check' : 'copy'} size={15} />
      {copied ? copiedLabel : copyLabel}
    </button>
  )
}

export default function Guide() {
  const { t, lang } = useLang()
  const g = guide[lang]
  const trackKeys = Object.keys(g.tracks)

  const [track, setTrack] = useState('panel')
  const [open, setOpen] = useState(0)
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    } catch {
      /* ignore unavailable storage */
    }
  }, [progress])

  const active = g.tracks[track]
  const steps = active.steps
  const doneList = progress[track] || []
  const doneCount = steps.filter((_, i) => doneList[i]).length
  const pct = Math.round((doneCount / steps.length) * 100)

  function switchTrack(key) {
    setTrack(key)
    setOpen(0)
  }

  function toggleDone(i) {
    setProgress((prev) => {
      const cur = (prev[track] || []).slice()
      cur[i] = !cur[i]
      const next = { ...prev, [track]: cur }
      if (cur[i] && i < steps.length - 1) setOpen(i + 1)
      return next
    })
  }

  return (
    <div className="guide">
      <header className="guide-bar">
        <a className="brand-link" href="#/">
          <span className="logo">
            <svg viewBox="0 0 100 100" width="26" height="26" aria-hidden="true">
              <path
                d="M 28 22 L 28 64 A 13 13 0 0 0 54 64 L 54 36 A 13 13 0 0 1 80 36 L 80 78"
                fill="none"
                stroke="url(#glg)"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="glg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">{t.brand}</span>
          </span>
        </a>
        <div className="guide-controls">
          <ThemeToggle />
          <LangSwitch />
          <a className="back-home" href="#/">
            <Icon name="arrow" size={16} className="icon-back" /> {g.backHome}
          </a>
        </div>
      </header>

      <div className="guide-inner">
        <div className="guide-head">
          <span className="eyebrow">
            <Icon name="book" size={14} /> {g.title}
          </span>
          <h1>{g.title}</h1>
          <p>{g.intro}</p>
        </div>

        {/* Track selector */}
        <h2 className="guide-subtitle">{g.tracksTitle}</h2>
        <div className="track-cards">
          {trackKeys.map((key) => {
            const tr = g.tracks[key]
            return (
              <button
                key={key}
                type="button"
                className={`track-card${track === key ? ' active' : ''}`}
                onClick={() => switchTrack(key)}
                aria-pressed={track === key}
              >
                <span className="track-icon">
                  <Icon name={TRACK_ICON[key]} size={22} />
                </span>
                <span className="track-meta">
                  <span className="track-label">{tr.label}</span>
                  <span className="track-tagline">{tr.tagline}</span>
                </span>
                <span className="track-time">{tr.time}</span>
              </button>
            )
          })}
        </div>

        {/* Prerequisites */}
        <div className="prereq">
          <div className="prereq-head">
            <strong>{g.ui.prereqTitle}</strong>
            <span className="prereq-time">
              {g.ui.timeLabel}: {active.time}
            </span>
          </div>
          <ul>
            {active.prereq.map((p, i) => (
              <li key={i}>
                <Icon name="check" size={16} /> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress */}
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-label">
            {pct}% {g.ui.complete}
          </span>
        </div>
        {pct === 100 && <p className="all-done">{g.ui.allDone}</p>}

        {/* Steps accordion */}
        <ol className="steps">
          {steps.map((step, i) => {
            const isOpen = open === i
            const isDone = !!doneList[i]
            return (
              <li key={i} className={`step${isOpen ? ' open' : ''}${isDone ? ' done' : ''}`}>
                <button
                  type="button"
                  className="step-header"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span className="step-num">
                    {isDone ? <Icon name="check" size={16} /> : i + 1}
                  </span>
                  <span className="step-title">{step.title}</span>
                  <span className="step-meta">
                    {g.ui.step} {i + 1} {g.ui.of} {steps.length}
                  </span>
                  <Icon name="chevron" size={18} className="step-chevron" />
                </button>

                {isOpen && (
                  <div className="step-body">
                    <p>{step.body}</p>

                    {step.list && (
                      <ol className="step-list">
                        {step.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ol>
                    )}

                    {step.code &&
                      step.code.map((c, j) => (
                        <div className="code-row" key={j}>
                          {c.label && <span className="code-label">{c.label}</span>}
                          <code dir="ltr">{c.value}</code>
                          <CopyButton
                            value={c.value}
                            copyLabel={g.ui.copy}
                            copiedLabel={g.ui.copied}
                          />
                        </div>
                      ))}

                    {step.note && (
                      <div className={`note note-${step.note.tone}`}>
                        <span className="note-dot" />
                        <span>{step.note.text}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className={`done-btn${isDone ? ' is-done' : ''}`}
                      onClick={() => toggleDone(i)}
                    >
                      <Icon name="check" size={16} />
                      {isDone ? g.ui.done : g.ui.markDone}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
