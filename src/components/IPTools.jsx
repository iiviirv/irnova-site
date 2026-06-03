import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import { LangSwitch, ThemeToggle } from './Controls.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

const ALL_PORTS = [8443, 2087, 2083, 2053, 443, 2096]

// Match IPv4 addresses anywhere in pasted text, de-duplicated (same logic as
// the original nova-ip-checker tool).
const IP_RE = /(?<![0-9])((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?![0-9])/g

function extractIPs(text) {
  return [...new Set([...text.matchAll(IP_RE)].map((m) => m[0]))]
}

function genName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let r = 'nova-'
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)]
  return r
}

export default function IPTools() {
  const { t } = useLang()
  const tt = t.tools
  const [input, setInput] = useState('')
  const [ports, setPorts] = useState(() => new Set(ALL_PORTS))
  const [output, setOutput] = useState('')
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const ipCount = useMemo(() => extractIPs(input).length, [input])
  const outLines = output ? output.split('\n').filter(Boolean).length : 0

  function togglePort(p) {
    setPorts((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  function generate() {
    const ips = extractIPs(input)
    const selected = ALL_PORTS.filter((p) => ports.has(p))
    const lines = []
    for (const ip of ips) {
      for (const port of selected) lines.push(`${ip}:${port}#${genName()}`)
    }
    setOutput(lines.join('\n'))
    setGenerated(true)
  }

  function clearInput() {
    setInput('')
    setOutput('')
    setGenerated(false)
  }

  async function copyOutput() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate()
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
                stroke="url(#tlg)"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="tlg" x1="0" y1="0" x2="1" y2="1">
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
            <Icon name="arrow" size={16} className="icon-back" /> {tt.back}
          </a>
        </div>
      </header>

      <div className="guide-inner tools-inner">
        <div className="guide-head">
          <span className="eyebrow">
            <Icon name="route" size={14} /> {t.nav.tools}
          </span>
          <h1>{tt.title}</h1>
          <p>{tt.intro}</p>
        </div>

        {/* Ports */}
        <div className="tool-card">
          <div className="tool-label">{tt.portsLabel}</div>
          <div className="port-chips">
            {ALL_PORTS.map((p) => (
              <button
                key={p}
                type="button"
                className={`port-chip${ports.has(p) ? ' on' : ''}`}
                aria-pressed={ports.has(p)}
                onClick={() => togglePort(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="tool-hint">{tt.portsHint}</div>
        </div>

        {/* Input */}
        <div className="tool-card">
          <div className="tool-label">{tt.inputLabel}</div>
          <textarea
            className="tool-textarea"
            dir="ltr"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={'1.1.1.1\n8.8.8.8\n...'}
            spellCheck="false"
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={generate}>
              <Icon name="route" size={16} /> {tt.generate}
            </button>
            <button type="button" className="btn btn-ghost" onClick={clearInput}>
              {tt.clear}
            </button>
            <span className="tool-stats">
              <strong>{ipCount}</strong> {tt.ipCount} · <strong>{outLines}</strong> {tt.outLines}
            </span>
          </div>
        </div>

        {/* Output */}
        <div className="tool-card">
          <div className="tool-label">{tt.outputLabel}</div>
          <pre className="tool-output" dir="ltr" tabIndex={0}>
            {output || (generated ? '' : '')}
          </pre>
          {generated && !output && <div className="tool-hint">{tt.empty}</div>}
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={copyOutput} disabled={!output}>
              <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? tt.copied : tt.copy}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setOutput('')
                setGenerated(false)
              }}
            >
              {tt.clearOutput}
            </button>
          </div>
          <div className="tool-hint">{tt.hint}</div>
        </div>
      </div>
    </div>
  )
}
