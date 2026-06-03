import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import Nav from './Nav.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

const NOVARADAR_URL = 'https://github.com/IRNova/NovaRadar/releases'

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
      <Nav />

      <div className="guide-inner tools-inner">
        <div className="guide-head">
          <span className="eyebrow">
            <Icon name="route" size={14} /> {t.nav.tools}
          </span>
          <h1>{tt.title}</h1>
          <p>{tt.intro}</p>
        </div>

        {/* How to get clean IPs */}
        <div className="tool-card">
          <div className="tool-label">{tt.scanTitle}</div>
          <p className="tool-sub">{tt.scanIntro}</p>
          <ol className="scan-steps">
            <li>{tt.scanStep1}</li>
            <li>{tt.scanStep2}</li>
            <li>{tt.scanStep3}</li>
          </ol>
          <div className="tool-actions">
            <a
              className="btn btn-primary"
              href={NOVARADAR_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="radar" size={16} /> {tt.scanCta}
            </a>
          </div>
          <div className="tool-hint">{tt.scanNote}</div>
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
