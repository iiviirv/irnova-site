import { useMemo, useRef, useState } from 'react'
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

function genUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// Browser-side latency probe. We can only honestly measure the time the browser
// takes to attempt a TLS handshake to a host: load a tiny resource over HTTPS and
// time how long onload/onerror takes. For a raw IP the certificate won't match so
// the request errors — but the error fires only AFTER the TCP + TLS round-trips,
// so the elapsed time tracks real latency. It is a rough estimate, not a true
// ping; reachability (did anything come back at all) is the reliable signal.
function probeHost(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const t0 = performance.now()
    const img = new Image()
    let done = false
    const finish = (reachable) => {
      if (done) return
      done = true
      clearTimeout(timer)
      img.onload = img.onerror = null
      resolve({ reachable, ms: reachable ? Math.round(performance.now() - t0) : null })
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    img.onload = img.onerror = () => finish(true)
    img.src = `https://${host}:${port}/cdn-cgi/trace?nova=${Math.random().toString(36).slice(2)}`
  })
}

// Run probes with a small concurrency cap so the browser doesn't open 100
// sockets at once. Each host gets two attempts; we keep the faster one.
async function probeAll(hosts, port, onProgress) {
  const results = []
  let i = 0
  let completed = 0
  const worker = async () => {
    while (i < hosts.length) {
      const idx = i++
      const host = hosts[idx]
      const a = await probeHost(host, port)
      const b = a.reachable ? await probeHost(host, port) : { reachable: false, ms: null }
      const reachable = a.reachable || b.reachable
      const ms =
        reachable && (a.ms != null || b.ms != null)
          ? Math.min(a.ms ?? Infinity, b.ms ?? Infinity)
          : null
      results.push({ host, port, reachable, ms })
      completed++
      onProgress(completed, hosts.length)
    }
  }
  const lanes = Math.min(6, hosts.length)
  await Promise.all(Array.from({ length: lanes }, worker))
  return results
}

function rankOf(ms, tt) {
  if (ms == null) return null
  if (ms < 150) return { key: 's', label: tt.chkGood }
  if (ms < 400) return { key: 'a', label: tt.chkOk }
  return { key: 'b', label: tt.chkSlow }
}

// ---- Config generators (one entry per host × port) ----
function buildConfigs({ protocol, hosts, ports, uuid, password, host: sni, path, security, network }) {
  const out = []
  const entries = []
  hosts.forEach((h) => ports.forEach((p) => entries.push({ ip: h, port: p })))

  if (protocol === 'vless') {
    entries.forEach((e, idx) => {
      const q = new URLSearchParams({ encryption: 'none', security, type: network })
      if (security === 'tls') {
        if (sni) q.set('sni', sni)
        q.set('fp', 'chrome')
      }
      if (network === 'ws') {
        q.set('path', path || '/')
        if (sni) q.set('host', sni)
      }
      out.push(`vless://${uuid}@${e.ip}:${e.port}?${q.toString()}#Nova-${idx + 1}`)
    })
    return out.join('\n')
  }

  if (protocol === 'vmess') {
    entries.forEach((e, idx) => {
      const obj = {
        v: '2',
        ps: `Nova-${idx + 1}`,
        add: e.ip,
        port: String(e.port),
        id: uuid,
        aid: '0',
        scy: 'auto',
        net: network,
        type: 'none',
        host: sni || '',
        path: path || '/',
        tls: security === 'tls' ? 'tls' : '',
        sni: security === 'tls' ? sni || '' : '',
      }
      out.push('vmess://' + btoa(unescape(encodeURIComponent(JSON.stringify(obj)))))
    })
    return out.join('\n')
  }

  if (protocol === 'trojan') {
    entries.forEach((e, idx) => {
      const q = new URLSearchParams({ security: security === 'tls' ? 'tls' : 'none', type: network })
      if (security === 'tls' && sni) q.set('sni', sni)
      if (network === 'ws') {
        q.set('path', path || '/')
        if (sni) q.set('host', sni)
      }
      out.push(`trojan://${password}@${e.ip}:${e.port}?${q.toString()}#Nova-${idx + 1}`)
    })
    return out.join('\n')
  }

  if (protocol === 'clash') {
    const proxies = entries.map((e, idx) => {
      const lines = [
        `  - name: Nova-${idx + 1}`,
        '    type: vless',
        `    server: ${e.ip}`,
        `    port: ${e.port}`,
        `    uuid: ${uuid}`,
        '    udp: true',
        `    tls: ${security === 'tls'}`,
        '    network: ' + network,
      ]
      if (security === 'tls' && sni) {
        lines.push(`    servername: ${sni}`)
        lines.push('    client-fingerprint: chrome')
      }
      if (network === 'ws') {
        lines.push('    ws-opts:')
        lines.push(`      path: ${path || '/'}`)
        if (sni) {
          lines.push('      headers:')
          lines.push(`        Host: ${sni}`)
        }
      }
      return lines.join('\n')
    })
    const names = entries.map((_, idx) => `Nova-${idx + 1}`)
    return (
      'proxies:\n' +
      proxies.join('\n') +
      '\n\nproxy-groups:\n  - name: "♻️ Nova"\n    type: url-test\n    proxies:\n      - ' +
      names.join('\n      - ') +
      '\n    url: http://www.gstatic.com/generate_204\n    interval: 300\n\nrules:\n  - GEOIP,IR,DIRECT\n  - MATCH,"♻️ Nova"'
    )
  }

  if (protocol === 'singbox') {
    const outbounds = entries.map((e, idx) => {
      const ob = {
        type: 'vless',
        tag: `Nova-${idx + 1}`,
        server: e.ip,
        server_port: e.port,
        uuid,
        flow: '',
      }
      if (security === 'tls') ob.tls = { enabled: true, server_name: sni || '', utls: { enabled: true, fingerprint: 'chrome' } }
      if (network === 'ws') ob.transport = { type: 'ws', path: path || '/', headers: sni ? { Host: sni } : {} }
      return ob
    })
    const tags = outbounds.map((o) => o.tag)
    return JSON.stringify(
      {
        outbounds: [
          { type: 'selector', tag: 'Nova', outbounds: ['auto', ...tags] },
          { type: 'urltest', tag: 'auto', outbounds: tags, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
          ...outbounds,
          { type: 'direct', tag: 'direct' },
        ],
      },
      null,
      2,
    )
  }

  return ''
}

const PROTOCOLS = [
  { id: 'vless', label: 'VLESS', file: 'nova-vless.txt' },
  { id: 'vmess', label: 'VMess', file: 'nova-vmess.txt' },
  { id: 'trojan', label: 'Trojan', file: 'nova-trojan.txt' },
  { id: 'clash', label: 'Clash', file: 'nova-clash.yaml' },
  { id: 'singbox', label: 'Sing-box', file: 'nova-singbox.json' },
]

export default function IPTools() {
  const { t } = useLang()
  const tt = t.tools

  // ---------- Probe ----------
  const [probeInput, setProbeInput] = useState('')
  const [results, setResults] = useState([])
  const [probing, setProbing] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [maxPing, setMaxPing] = useState(900) // 900 = show all

  const probeHostCount = useMemo(() => extractHosts(probeInput).length, [probeInput])

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.reachable !== b.reachable) return a.reachable ? -1 : 1
      return (a.ms ?? Infinity) - (b.ms ?? Infinity)
    })
  }, [results])

  const visibleResults = useMemo(
    () => sortedResults.filter((r) => maxPing >= 900 || (r.reachable && r.ms <= maxPing)),
    [sortedResults, maxPing],
  )

  const reachableResults = sortedResults.filter((r) => r.reachable)
  const maxBar = reachableResults.length ? Math.max(...reachableResults.map((r) => r.ms)) : 1

  async function runProbe() {
    const hosts = extractHosts(probeInput).slice(0, 40)
    if (!hosts.length) return
    setProbing(true)
    setResults([])
    setProgress({ done: 0, total: hosts.length })
    const port = ALL_PORTS.find((p) => TLS_PORTS.includes(p) && ports.has(p)) || 443
    const res = await probeAll(hosts, port, (done, total) => setProgress({ done, total }))
    setResults(res)
    setProbing(false)
  }

  function useProbeInBuilder() {
    const good = reachableResults.map((r) => r.host)
    if (good.length) setBuilderHosts(good.join('\n'))
  }

  // ---------- Ports (shared with builder) ----------
  const [ports, setPorts] = useState(() => new Set(TLS_PORTS))
  function togglePort(p) {
    setPorts((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  // ---------- Config builder ----------
  const [protocol, setProtocol] = useState('vless')
  const [builderHosts, setBuilderHosts] = useState('')
  const [workerHost, setWorkerHost] = useState('')
  const [uuid, setUuid] = useState('')
  const [password, setPassword] = useState('')
  const [path, setPath] = useState('/')
  const [security, setSecurity] = useState('tls')
  const [network, setNetwork] = useState('ws')
  const [builderOut, setBuilderOut] = useState('')
  const [builderCopied, setBuilderCopied] = useState(false)
  const builderRef = useRef(null)

  const builderHostCount = useMemo(() => extractHosts(builderHosts).length, [builderHosts])
  const needsCred = protocol === 'trojan' ? password.trim() : uuid.trim()
  const selectedPorts = ALL_PORTS.filter((p) => ports.has(p))
  const builderOutCount = builderOut ? builderOut.split('\n').filter((l) => l.startsWith('vless') || l.startsWith('vmess') || l.startsWith('trojan')).length : 0

  function generate() {
    const hosts = extractHosts(builderHosts)
    if (!hosts.length || !selectedPorts.length || !needsCred) return
    const cfg = buildConfigs({
      protocol,
      hosts,
      ports: selectedPorts,
      uuid: uuid.trim() || genUUID(),
      password: password.trim(),
      host: workerHost.trim(),
      path: path.trim() || '/',
      security,
      network,
    })
    setBuilderOut(cfg)
    setTimeout(() => builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 30)
  }

  async function copyBuilder() {
    if (!builderOut) return
    try {
      await navigator.clipboard.writeText(builderOut)
    } catch {
      /* clipboard may be blocked */
    }
    setBuilderCopied(true)
    setTimeout(() => setBuilderCopied(false), 1500)
  }

  function downloadBuilder() {
    if (!builderOut) return
    const meta = PROTOCOLS.find((p) => p.id === protocol)
    const mime =
      protocol === 'clash' ? 'text/yaml' : protocol === 'singbox' ? 'application/json' : 'text/plain'
    const blob = new Blob([builderOut], { type: mime })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = meta?.file || 'nova-config.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const isTrojan = protocol === 'trojan'

  // ---------- Connection check ----------
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

        {/* Latency probe */}
        <div className="tool-card">
          <div className="tool-label">{tt.probeTitle}</div>
          <p className="tool-sub">{tt.probeIntro}</p>
          <textarea
            className="tool-textarea"
            dir="ltr"
            value={probeInput}
            onChange={(e) => setProbeInput(e.target.value)}
            placeholder={'104.16.0.1\n104.17.0.1\nclean.example.com\n...'}
            spellCheck="false"
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={runProbe} disabled={probing || !probeHostCount}>
              <Icon name="radar" size={16} />{' '}
              {probing ? `${tt.probeRunning} ${progress.done}/${progress.total}` : tt.probeRun}
            </button>
            {results.length > 0 && (
              <button type="button" className="btn btn-ghost" onClick={useProbeInBuilder}>
                <Icon name="route" size={16} /> {tt.probeUse}
              </button>
            )}
            <span className="tool-stats">
              <strong>{probeHostCount}</strong> {tt.probeHosts}
              {results.length > 0 && (
                <>
                  {' · '}
                  <strong>{reachableResults.length}</strong> {tt.probeResponded}
                </>
              )}
            </span>
          </div>

          {results.length > 0 && (
            <>
              {/* Ping filter */}
              <div className="probe-filter">
                <label htmlFor="maxPing">
                  {tt.probeFilter}:{' '}
                  <strong>{maxPing >= 900 ? tt.probeFilterAll : `≤ ${maxPing} ms`}</strong>
                </label>
                <input
                  id="maxPing"
                  type="range"
                  min="50"
                  max="900"
                  step="50"
                  value={maxPing}
                  onChange={(e) => setMaxPing(Number(e.target.value))}
                />
              </div>

              {/* Bar chart */}
              {reachableResults.length > 0 && (
                <div className="probe-chart" aria-hidden="true">
                  {reachableResults.map((r) => {
                    const rank = rankOf(r.ms, tt)
                    return (
                      <div className="probe-bar-wrap" key={r.host + r.port}>
                        <span className="probe-bar-ms">{r.ms}</span>
                        <span
                          className={`probe-bar rank-${rank?.key || 'b'}`}
                          style={{ height: `${Math.max(8, Math.round((r.ms / maxBar) * 100))}%` }}
                        />
                        <span className="probe-bar-label">{r.host.split('.').slice(-2).join('.')}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Result rows */}
              <div className="probe-list">
                {visibleResults.map((r) => {
                  const rank = rankOf(r.ms, tt)
                  return (
                    <div className={`probe-row${r.reachable ? '' : ' bad'}`} key={r.host + r.port}>
                      <span className="probe-host" dir="ltr">
                        {r.host}
                      </span>
                      {r.reachable ? (
                        <span className="probe-meta">
                          <span className={`rank-badge rank-${rank?.key || 'b'}`}>{rank?.label}</span>
                          <span className="probe-ms">{r.ms} ms</span>
                        </span>
                      ) : (
                        <span className="probe-meta">
                          <span className="probe-unreach">
                            <Icon name="shield" size={14} /> {tt.probeUnreachable}
                          </span>
                        </span>
                      )}
                    </div>
                  )
                })}
                {visibleResults.length === 0 && <div className="tool-hint">{tt.probeNoneInRange}</div>}
              </div>
            </>
          )}

          <div className="tool-hint">{tt.probeNote}</div>
        </div>

        {/* Ports */}
        <div className="tool-card">
          <div className="tool-label">{tt.portsLabel}</div>
          <div className="port-group-label">{tt.portsTls}</div>
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
          <div className="port-group-label" style={{ marginTop: '14px' }}>
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

        {/* Config builder */}
        <div className="tool-card">
          <div className="tool-label">{tt.buildTitle}</div>
          <p className="tool-sub">{tt.buildIntro}</p>

          <div className="proto-tabs">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`proto-tab${protocol === p.id ? ' active' : ''}`}
                onClick={() => {
                  setProtocol(p.id)
                  setBuilderOut('')
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="build-grid">
            <label className="build-field build-wide">
              <span>{tt.fieldWorkerHost}</span>
              <input
                type="text"
                dir="ltr"
                value={workerHost}
                onChange={(e) => setWorkerHost(e.target.value)}
                placeholder="your-worker.workers.dev"
                spellCheck="false"
              />
            </label>

            {isTrojan ? (
              <label className="build-field">
                <span>{tt.fieldPassword}</span>
                <input
                  type="text"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  spellCheck="false"
                />
              </label>
            ) : (
              <label className="build-field build-uuid">
                <span>UUID</span>
                <span className="uuid-row">
                  <input
                    type="text"
                    dir="ltr"
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    placeholder="00000000-0000-0000-0000-000000000000"
                    spellCheck="false"
                  />
                  <button type="button" className="mini-btn" onClick={() => setUuid(genUUID())} title={tt.fieldUuidGen}>
                    <Icon name="bolt" size={14} />
                  </button>
                </span>
              </label>
            )}

            <label className="build-field">
              <span>{tt.fieldSecurity}</span>
              <select value={security} onChange={(e) => setSecurity(e.target.value)}>
                <option value="tls">TLS</option>
                <option value="none">none</option>
              </select>
            </label>

            <label className="build-field">
              <span>{tt.fieldNetwork}</span>
              <select value={network} onChange={(e) => setNetwork(e.target.value)}>
                <option value="ws">WebSocket (ws)</option>
                <option value="tcp">TCP</option>
                <option value="grpc">gRPC</option>
              </select>
            </label>

            <label className="build-field">
              <span>{tt.fieldPath}</span>
              <input
                type="text"
                dir="ltr"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/"
                spellCheck="false"
              />
            </label>
          </div>

          <label className="build-field build-wide" style={{ marginTop: '14px' }}>
            <span>{tt.fieldAddresses}</span>
            <textarea
              className="tool-textarea"
              dir="ltr"
              value={builderHosts}
              onChange={(e) => setBuilderHosts(e.target.value)}
              placeholder={'104.16.0.1\nclean.example.com\n...'}
              spellCheck="false"
              style={{ minHeight: '110px' }}
            />
          </label>

          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={generate} disabled={!builderHostCount || !selectedPorts.length || !needsCred}>
              <Icon name="bolt" size={16} /> {tt.buildGenerate}
            </button>
            <span className="tool-stats">
              <strong>{builderHostCount}</strong> {tt.probeHosts} × <strong>{selectedPorts.length}</strong>{' '}
              {tt.buildPorts}
            </span>
          </div>
          {!needsCred && builderHostCount > 0 && (
            <div className="tool-hint">{isTrojan ? tt.buildNeedPassword : tt.buildNeedUuid}</div>
          )}

          {builderOut && (
            <div ref={builderRef} className="build-output">
              <div className="build-output-top">
                <span>
                  <Icon name="check" size={15} />{' '}
                  {builderOutCount > 0
                    ? `${builderOutCount} ${tt.buildLinks}`
                    : PROTOCOLS.find((p) => p.id === protocol)?.label}
                </span>
                <span className="build-output-actions">
                  <button type="button" className="mini-btn" onClick={copyBuilder}>
                    <Icon name={builderCopied ? 'check' : 'copy'} size={14} /> {builderCopied ? tt.copied : tt.copy}
                  </button>
                  <button type="button" className="mini-btn" onClick={downloadBuilder}>
                    <Icon name="download" size={14} /> {tt.buildDownload}
                  </button>
                </span>
              </div>
              <pre className="tool-output" dir="ltr" tabIndex={0}>
                {builderOut}
              </pre>
            </div>
          )}

          <div className="tool-hint">{tt.buildNote}</div>
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
