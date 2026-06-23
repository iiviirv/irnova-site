import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import Nav from './Nav.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

const NOVARADAR_URL = 'https://github.com/IRNova/NovaRadar/releases'

// Cloudflare-proxied ports. TLS ports carry security=tls configs; non-TLS
// (HTTP) ports are for security=none / non-TLS mode (matches the worker).
const TLS_PORTS = [443, 2053, 2083, 2087, 2096, 8443]
const NONTLS_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095]
const ALL_PORTS = [...TLS_PORTS, ...NONTLS_PORTS]

// Match IPv4 addresses anywhere in pasted text (de-duplicated).
const IP_RE = /(?<![0-9])((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?![0-9])/g
const IPV4_RE = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

// Accept BOTH raw IPv4 addresses and domain names. Domains are passed through
// as-is — domain:port works in every client, and keeping them unresolved means
// nothing leaves the browser (no DNS lookup), consistent with this tool's
// privacy promise. IPs are matched anywhere in pasted text; domains are read
// token-by-token with any scheme/port/path stripped first.
function extractHosts(text) {
  const seen = new Set()
  const hosts = []
  const add = (h) => {
    if (h && !seen.has(h)) {
      seen.add(h)
      hosts.push(h)
    }
  }
  for (const m of text.matchAll(IP_RE)) add(m[0])
  for (let tok of text.split(/[\s,]+/)) {
    tok = tok
      .trim()
      .replace(/^[a-z]+:\/\//i, '')
      .split(/[/#?]/)[0]
      .replace(/:\d+$/, '')
    if (tok && !IPV4_RE.test(tok) && DOMAIN_RE.test(tok)) add(tok.toLowerCase())
  }
  return hosts
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
  const [ports, setPorts] = useState(() => new Set(TLS_PORTS))
  const [output, setOutput] = useState('')
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const ipCount = useMemo(() => extractHosts(input).length, [input])
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
    const hosts = extractHosts(input)
    const selected = ALL_PORTS.filter((p) => ports.has(p))
    const lines = []
    for (const host of hosts) {
      for (const port of selected) lines.push(`${host}:${port}#${genName()}`)
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
          <div
            className="port-group-label"
            style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7, margin: '4px 0 8px' }}
          >
            {tt.portsTls}
          </div>
          <div className="port-chips">
            {TLS_PORTS.map((p) => (
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
          <div
            className="port-group-label"
            style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7, margin: '14px 0 8px' }}
          >
            {tt.portsNonTls}
          </div>
          <div className="port-chips">
            {NONTLS_PORTS.map((p) => (
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
            placeholder={'1.1.1.1\n8.8.8.8\nclean.example.com\n...'}
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
