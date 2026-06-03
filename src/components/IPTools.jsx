import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import { LangSwitch, ThemeToggle } from './Controls.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'
import { fetchSources, randomIPsFromCidrs } from '../lib/cleanips.js'

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

  // --- Clean Cloudflare IPs ---
  const [sources, setSources] = useState([])
  const [selSrc, setSelSrc] = useState(() => new Set())
  const [srcCount, setSrcCount] = useState(100)
  const [srcOutput, setSrcOutput] = useState('')
  const [srcCopied, setSrcCopied] = useState(false)

  useEffect(() => {
    let alive = true
    fetchSources().then((s) => {
      if (!alive) return
      setSources(s)
      setSelSrc(new Set(s.length ? [s[0].id] : []))
    })
    return () => {
      alive = false
    }
  }, [])

  function toggleSrc(id) {
    setSelSrc((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getIPs() {
    const cidrs = sources.filter((s) => selSrc.has(s.id)).flatMap((s) => s.cidrs)
    setSrcOutput(randomIPsFromCidrs(cidrs, srcCount).join('\n'))
  }

  async function copySrc() {
    if (!srcOutput) return
    try {
      await navigator.clipboard.writeText(srcOutput)
    } catch {
      /* clipboard may be blocked */
    }
    setSrcCopied(true)
    setTimeout(() => setSrcCopied(false), 1500)
  }

  // --- Connection check ---
  const [chk, setChk] = useState(null)
  const [chkBusy, setChkBusy] = useState(false)

  async function runCheck() {
    setChkBusy(true)
    setChk(null)
    const times = []
    let reachable = false
    for (let i = 0; i < 5; i++) {
      try {
        const t0 = performance.now()
        await fetch('https://speed.cloudflare.com/__down?bytes=1000&_=' + Math.random(), {
          mode: 'no-cors',
          cache: 'no-store',
        })
        reachable = true
        if (i > 0) times.push(performance.now() - t0) // drop first (warm-up)
      } catch {
        /* unreachable attempt */
      }
    }
    if (reachable && times.length) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      const label = avg < 150 ? tt.chkGood : avg < 400 ? tt.chkOk : tt.chkSlow
      setChk({ reachable: true, avgMs: avg, label })
    } else {
      setChk({ reachable })
    }
    setChkBusy(false)
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

        {/* Clean Cloudflare IPs */}
        <div className="tool-card">
          <div className="tool-label">{tt.srcTitle}</div>
          <p className="tool-sub">{tt.srcIntro}</p>

          <div className="tool-mini-label">{tt.srcSelect}</div>
          <div className="port-chips">
            {sources.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`port-chip${selSrc.has(s.id) ? ' on' : ''}`}
                aria-pressed={selSrc.has(s.id)}
                onClick={() => toggleSrc(s.id)}
              >
                {s.name} <span className="chip-count">{s.cidrs.length}</span>
              </button>
            ))}
          </div>

          <div className="tool-mini-label">{tt.srcCount}</div>
          <div className="port-chips">
            {[50, 100, 200].map((n) => (
              <button
                key={n}
                type="button"
                className={`port-chip${srcCount === n ? ' on' : ''}`}
                onClick={() => setSrcCount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={getIPs} disabled={selSrc.size === 0}>
              <Icon name="radar" size={16} /> {tt.srcGet}
            </button>
          </div>

          {srcOutput && (
            <>
              <pre className="tool-output" dir="ltr" style={{ minHeight: '120px' }}>
                {srcOutput}
              </pre>
              <div className="tool-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setInput(srcOutput)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  {tt.srcUse}
                </button>
                <button type="button" className="btn btn-ghost" onClick={copySrc}>
                  {srcCopied ? tt.copied : tt.srcCopy}
                </button>
              </div>
            </>
          )}
          <div className="tool-hint">{tt.srcNote}</div>
        </div>

        {/* Connection check */}
        <div className="tool-card">
          <div className="tool-label">{tt.chkTitle}</div>
          <p className="tool-sub">{tt.chkIntro}</p>
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={runCheck} disabled={chkBusy}>
              <Icon name="radar" size={16} /> {chkBusy ? tt.chkRunning : tt.chkRun}
            </button>
          </div>
          {chk && (
            <div className={`check-result ${chk.reachable ? 'ok' : 'bad'}`}>
              <Icon name={chk.reachable ? 'check' : 'shield'} size={18} />
              <span>{chk.reachable ? tt.chkReachable : tt.chkUnreachable}</span>
              {chk.reachable && chk.avgMs !== undefined && (
                <span className="check-latency">
                  {tt.chkLatency}: <strong>{chk.avgMs} ms</strong> · {chk.label}
                </span>
              )}
            </div>
          )}
          <div className="tool-hint">{tt.chkNote}</div>
        </div>
      </div>
    </div>
  )
}
