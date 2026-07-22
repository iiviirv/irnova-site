import { useEffect, useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import Icon from './Icon.jsx'
import Nav from './Nav.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

// Render a config string as a scannable QR (dark modules on white, with a quiet
// zone). Generated locally — the config never leaves the browser.
function QrSvg({ text, size = 138 }) {
  const { rects, dim } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(text)
    qr.make()
    const c = qr.getModuleCount()
    const margin = 2
    const cells = []
    for (let r = 0; r < c; r++) {
      for (let col = 0; col < c; col++) {
        if (qr.isDark(r, col)) cells.push(`${col + margin} ${r + margin}`)
      }
    }
    return { rects: cells, dim: c + margin * 2 }
  }, [text])
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${dim} ${dim}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code"
    >
      <rect width={dim} height={dim} fill="#ffffff" />
      {rects.map((xy) => {
        const [x, y] = xy.split(' ')
        return <rect key={xy} x={x} y={y} width={1.04} height={1.04} fill="#05060a" />
      })}
    </svg>
  )
}

// Remembered builder settings (worker host, UUID, protocol, etc.) so a returning
// user doesn't re-type them. Password is never stored.
const PREFS_KEY = 'nova-tools-prefs'
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}
const SAVED = typeof localStorage !== 'undefined' ? loadPrefs() : {}

// Parse an existing vless:// / vmess:// / trojan:// link into builder fields, so
// a user can drop in their current Nova config and only swap the clean IPs.
function parseConfig(raw) {
  const link = (raw || '').trim()
  try {
    if (link.startsWith('vless://') || link.startsWith('trojan://')) {
      const isVless = link.startsWith('vless://')
      const url = new URL(link)
      const cred = decodeURIComponent(url.username)
      const p = url.searchParams
      const sec = (p.get('security') || 'tls') === 'none' ? 'none' : 'tls'
      return {
        protocol: isVless ? 'vless' : 'trojan',
        uuid: isVless ? cred : '',
        password: isVless ? '' : cred,
        host: p.get('sni') || p.get('host') || '',
        path: decodeURIComponent(p.get('path') || '/'),
        security: sec,
        network: p.get('type') || 'ws',
      }
    }
    if (link.startsWith('vmess://')) {
      const json = JSON.parse(decodeURIComponent(escape(atob(link.slice(8)))))
      return {
        protocol: 'vmess',
        uuid: json.id || '',
        password: '',
        host: json.sni || json.host || '',
        path: json.path || '/',
        security: json.tls ? 'tls' : 'none',
        network: json.net || 'ws',
      }
    }
  } catch {
    return null
  }
  return null
}

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

// Cloudflare's public IPv4 ranges (the big edge blocks that answer on 443).
// Auto-scan picks random addresses from these and probes them — the same honest
// HTTPS-timing method used for pasted hosts, just self-fed.
const CF_RANGES = [
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '162.158.0.0/15',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '198.41.128.0/17',
]

// Operator hint: which Cloudflare ranges to favour per Iranian ISP. Clean IPs
// genuinely differ between operators (each ISP routes to different CF edges), so
// this biases the scan toward ranges that tend to work on that network. It's a
// community heuristic, not a guarantee — "All" scans every range evenly.
const OPERATOR_RANGES = {
  all: CF_RANGES,
  mci: ['104.16.0.0/13', '172.64.0.0/13', '162.159.0.0/16', '188.114.96.0/20'],
  mtn: ['108.162.192.0/18', '104.24.0.0/14', '172.64.0.0/13', '162.158.0.0/15'],
  tci: ['104.16.0.0/13', '162.159.0.0/16', '141.101.64.0/18'],
  shatel: ['104.16.0.0/13', '104.24.0.0/14', '190.93.240.0/20'],
}
const OPERATORS = ['all', 'mci', 'mtn', 'tci', 'shatel']

function ipToInt(ip) {
  return ip.split('.').reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0
}
function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}
function randomCfIp(operator = 'all') {
  const ranges = OPERATOR_RANGES[operator] || CF_RANGES
  const cidr = ranges[Math.floor(Math.random() * ranges.length)]
  const [base, prefix] = cidr.split('/')
  const hostBits = 32 - Number(prefix)
  const size = 2 ** hostBits
  const offset = 1 + Math.floor(Math.random() * (size - 2)) // skip network + broadcast
  return intToIp((ipToInt(base) + offset) >>> 0)
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

  // ---------- Active tab ----------
  const [tab, setTab] = useState('scan')

  // ---------- Probe ----------
  const [probeInput, setProbeInput] = useState('')
  const [results, setResults] = useState([])
  const [probing, setProbing] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [maxPing, setMaxPing] = useState(900) // 900 = show all
  const [scanning, setScanning] = useState(false)
  const [scanStats, setScanStats] = useState({ tested: 0, found: 0 })
  const [operator, setOperator] = useState(SAVED.operator || 'all')
  const [scanCount, setScanCount] = useState(50)
  const [ipsWithPorts, setIpsWithPorts] = useState(false)
  const scanAbort = useRef(false)

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

  const [ipsCopied, setIpsCopied] = useState(false)
  function probeIpList() {
    const hosts = reachableResults.map((r) => r.host)
    if (!ipsWithPorts) return hosts.join('\n')
    const selPorts = ALL_PORTS.filter((p) => ports.has(p))
    const usePorts = selPorts.length ? selPorts : [443]
    return hosts.flatMap((h) => usePorts.map((p) => `${h}:${p}`)).join('\n')
  }
  async function copyProbeIps() {
    const txt = probeIpList()
    if (!txt) return
    try {
      await navigator.clipboard.writeText(txt)
    } catch {
      /* clipboard may be blocked */
    }
    setIpsCopied(true)
    setTimeout(() => setIpsCopied(false), 1500)
  }
  function downloadProbeIps() {
    const txt = probeIpList()
    if (!txt) return
    const blob = new Blob([txt], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'nova-clean-ips.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function stopScan() {
    scanAbort.current = true
  }

  // Auto-scan: self-feed random Cloudflare IPs through the same honest probe.
  // Tests in a batch so it can't run forever; `append` keeps prior finds and
  // scans another batch. Concurrency is interleaved (single thread), so the
  // shared counters mutate safely between awaits.
  async function autoScan(append = false) {
    setScanning(true)
    scanAbort.current = false
    const port = ALL_PORTS.find((p) => TLS_PORTS.includes(p) && ports.has(p)) || 443
    const seen = new Set()
    let foundCount = 0
    if (append) {
      results.forEach((r) => seen.add(r.host))
      foundCount = results.filter((r) => r.reachable).length
    } else {
      setResults([])
    }
    let tested = 0
    const BATCH = scanCount
    const lanes = 8
    setScanStats({ tested: 0, found: foundCount })
    const worker = async () => {
      while (!scanAbort.current && tested < BATCH) {
        tested++
        let ip = randomCfIp(operator)
        let guard = 0
        while (seen.has(ip) && guard++ < 5) ip = randomCfIp(operator)
        seen.add(ip)
        setScanStats({ tested, found: foundCount })
        const r = await probeHost(ip, port)
        if (r.reachable) {
          foundCount++
          setResults((prev) => [...prev, { host: ip, port, reachable: true, ms: r.ms }])
          setScanStats({ tested, found: foundCount })
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(lanes, BATCH) }, worker))
    setScanning(false)
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
  const [protocol, setProtocol] = useState(SAVED.protocol || 'vless')
  const [builderHosts, setBuilderHosts] = useState('')
  const [workerHost, setWorkerHost] = useState(SAVED.workerHost || '')
  const [uuid, setUuid] = useState(SAVED.uuid || '')
  const [password, setPassword] = useState('')
  const [path, setPath] = useState(SAVED.path || '/')
  const [security, setSecurity] = useState(SAVED.security || 'tls')
  const [network, setNetwork] = useState(SAVED.network || 'ws')
  const [builderOut, setBuilderOut] = useState('')
  const [builderCopied, setBuilderCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [importLink, setImportLink] = useState('')
  const [importErr, setImportErr] = useState(false)
  const builderRef = useRef(null)

  // QR codes only make sense for single-link protocols (not whole Clash/Sing-box
  // files). Cap how many we render so a big IP × port list doesn't flood the page.
  const QR_LIMIT = 12
  const qrLinks = useMemo(() => {
    if (!builderOut || !['vless', 'vmess', 'trojan'].includes(protocol)) return []
    return builderOut.split('\n').filter(Boolean).slice(0, QR_LIMIT)
  }, [builderOut, protocol])

  // Persist builder settings (not the password) whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ operator, protocol, workerHost, uuid, path, security, network }),
      )
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [operator, protocol, workerHost, uuid, path, security, network])

  function importConfig() {
    const parsed = parseConfig(importLink)
    if (!parsed) {
      setImportErr(true)
      return
    }
    setImportErr(false)
    setProtocol(parsed.protocol)
    if (parsed.uuid) setUuid(parsed.uuid)
    if (parsed.password) setPassword(parsed.password)
    if (parsed.host) setWorkerHost(parsed.host)
    setPath(parsed.path || '/')
    setSecurity(parsed.security)
    setNetwork(parsed.network)
    setBuilderOut('')
  }

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

  async function measureDownloadMbps() {
    // Pull real bytes from the same-origin /speedtest Worker and time it. The
    // function exists only on the deployed site (Pages), so this no-ops in plain
    // `vite preview`.
    const sizeBytes = 6 * 1024 * 1024
    try {
      const t0 = performance.now()
      const resp = await fetch('/speedtest?bytes=' + sizeBytes + '&_=' + Math.random(), {
        cache: 'no-store',
      })
      if (!resp.ok || !resp.body) return null
      const reader = resp.body.getReader()
      let received = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        received += value.length
      }
      const secs = (performance.now() - t0) / 1000
      if (secs <= 0 || received <= 0) return null
      return (received * 8) / secs / 1e6 // Mbps
    } catch {
      return null
    }
  }

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
    let avg
    let label
    if (reachable && times.length) {
      avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      label = avg < 150 ? tt.chkGood : avg < 400 ? tt.chkOk : tt.chkSlow
    }
    // Real download throughput (independent of reachability ping above).
    const mbps = await measureDownloadMbps()
    setChk({ reachable: reachable || mbps != null, avgMs: avg, label, mbps })
    setChkBusy(false)
  }

  // ---------- IP formatter (Nova panel IP list: ADDRESS:PORT#name) ----------
  const [fmtInput, setFmtInput] = useState('')
  const [fmtOut, setFmtOut] = useState('')
  const [fmtGenerated, setFmtGenerated] = useState(false)
  const [fmtCopied, setFmtCopied] = useState(false)
  const fmtHostCount = useMemo(() => extractHosts(fmtInput).length, [fmtInput])
  const fmtOutLines = fmtOut ? fmtOut.split('\n').filter(Boolean).length : 0

  function fmtGenerate() {
    const hosts = extractHosts(fmtInput)
    const sel = ALL_PORTS.filter((p) => ports.has(p))
    const usePorts = sel.length ? sel : [443]
    const lines = []
    for (const h of hosts) for (const p of usePorts) lines.push(`${h}:${p}#${genName()}`)
    setFmtOut(lines.join('\n'))
    setFmtGenerated(true)
  }
  function fmtClear() {
    setFmtInput('')
    setFmtOut('')
    setFmtGenerated(false)
  }
  async function fmtCopy() {
    if (!fmtOut) return
    try {
      await navigator.clipboard.writeText(fmtOut)
    } catch {
      /* clipboard may be blocked */
    }
    setFmtCopied(true)
    setTimeout(() => setFmtCopied(false), 1500)
  }
  function fmtDownload() {
    if (!fmtOut) return
    const blob = new Blob([fmtOut], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'nova-ip-list.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // Send the reachable scan IPs to the formatter / builder and jump there.
  function useScanInFormatter() {
    const good = reachableResults.map((r) => r.host)
    if (good.length) setFmtInput(good.join('\n'))
    setTab('format')
  }
  function useScanInBuilder() {
    useProbeInBuilder()
    setTab('build')
  }

  // Shared ports selector (used by Format and Build tabs).
  function renderPorts() {
    return (
      <>
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
      </>
    )
  }

  const TABS = [
    { id: 'scan', icon: 'radar', label: tt.tabScan },
    { id: 'format', icon: 'route', label: tt.tabFormat },
    { id: 'build', icon: 'bolt', label: tt.tabBuild },
    { id: 'speed', icon: 'gauge', label: tt.tabSpeed },
  ]

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

        {/* How to use — quick guide */}
        <div className="tool-card tool-guide">
          <div className="tool-label">{tt.guide.title}</div>
          <div className="guide-steps">
            {[1, 2, 3, 4].map((n) => (
              <div className="guide-step" key={n}>
                <span className="guide-step-num">{n}</span>
                <span className="guide-step-body">
                  <strong>{tt.guide[`s${n}t`]}</strong>
                  <span>{tt.guide[`s${n}`]}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="tool-hint">{tt.guide.note}</div>
        </div>

        {/* Tab navigation */}
        <div className="tool-tabs" role="tablist">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              type="button"
              role="tab"
              aria-selected={tab === tb.id}
              className={`tool-tab${tab === tb.id ? ' active' : ''}`}
              onClick={() => setTab(tb.id)}
            >
              <Icon name={tb.icon} size={15} /> {tb.label}
            </button>
          ))}
        </div>

        {/* ============================= SCAN ============================= */}
        {tab === 'scan' && (
          <>
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

          {/* Auto-scan: no list needed */}
          <div className="scan-controls">
            <label className="scan-control">
              <span>{tt.operatorLabel}</span>
              <select value={operator} onChange={(e) => setOperator(e.target.value)} disabled={scanning}>
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {tt.operators[op]}
                  </option>
                ))}
              </select>
            </label>
            <label className="scan-control">
              <span>{tt.scanCountLabel}</span>
              <select
                value={scanCount}
                onChange={(e) => setScanCount(Number(e.target.value))}
                disabled={scanning}
              >
                {[25, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="auto-scan-row">
            {!scanning ? (
              <button type="button" className="btn btn-primary" onClick={() => autoScan(false)}>
                <Icon name="radar" size={16} /> {tt.autoScan}
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={stopScan}>
                <Icon name="close" size={16} /> {tt.autoStop}
              </button>
            )}
            {results.length > 0 && !scanning && (
              <button type="button" className="btn btn-ghost" onClick={() => autoScan(true)}>
                {tt.autoMore}
              </button>
            )}
            {(scanning || scanStats.tested > 0) && (
              <span className="tool-stats">
                <strong>{scanStats.tested}</strong> {tt.autoTested}, <strong>{scanStats.found}</strong>{' '}
                {tt.probeResponded}
              </span>
            )}
          </div>
          <div className="tool-hint">{tt.autoNote}</div>

          <div className="probe-or">{tt.probeOr}</div>

          <textarea
            className="tool-textarea"
            dir="ltr"
            value={probeInput}
            onChange={(e) => setProbeInput(e.target.value)}
            placeholder={'104.16.0.1\n104.17.0.1\nclean.example.com\n...'}
            spellCheck="false"
          />
          <div className="tool-actions">
            <button type="button" className="btn btn-primary" onClick={runProbe} disabled={probing || scanning || !probeHostCount}>
              <Icon name="radar" size={16} />{' '}
              {probing ? `${tt.probeRunning} ${progress.done}/${progress.total}` : tt.probeRun}
            </button>
            <span className="tool-stats">
              <strong>{probeHostCount}</strong> {tt.probeHosts}
              {results.length > 0 && (
                <>
                  {', '}
                  <strong>{reachableResults.length}</strong> {tt.probeResponded}
                </>
              )}
            </span>
          </div>

          {results.length > 0 && (
            <>
              {/* Result actions: list of clean IPs */}
              <div className="probe-actions">
                <button
                  type="button"
                  className="mini-btn"
                  onClick={copyProbeIps}
                  disabled={!reachableResults.length}
                >
                  <Icon name={ipsCopied ? 'check' : 'copy'} size={14} />{' '}
                  {ipsCopied ? tt.copied : `${tt.probeCopyIps} (${reachableResults.length})`}
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={downloadProbeIps}
                  disabled={!reachableResults.length}
                >
                  <Icon name="download" size={14} /> {tt.buildDownload}
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={useScanInFormatter}
                  disabled={!reachableResults.length}
                >
                  <Icon name="route" size={14} /> {tt.fmtUse}
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={useScanInBuilder}
                  disabled={!reachableResults.length}
                >
                  <Icon name="bolt" size={14} /> {tt.probeUse}
                </button>
                <label className="ports-toggle">
                  <input
                    type="checkbox"
                    checked={ipsWithPorts}
                    onChange={(e) => setIpsWithPorts(e.target.checked)}
                  />
                  {tt.ipsWithPorts}
                </label>
              </div>

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
          </>
        )}

        {/* ============================ FORMAT ============================ */}
        {tab === 'format' && (
          <div className="tool-card">
            <div className="tool-label">{tt.fmtTitle}</div>
            <p className="tool-sub">{tt.fmtIntro}</p>

            <div className="tool-mini-label">{tt.portsLabel}</div>
            {renderPorts()}
            <div className="tool-hint">{tt.portsHint}</div>

            <div className="tool-mini-label" style={{ marginTop: '18px' }}>{tt.inputLabel}</div>
            <textarea
              className="tool-textarea"
              dir="ltr"
              value={fmtInput}
              onChange={(e) => setFmtInput(e.target.value)}
              placeholder={'104.16.0.1\n104.17.0.1\nclean.example.com\n...'}
              spellCheck="false"
            />
            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={fmtGenerate} disabled={!fmtHostCount}>
                <Icon name="route" size={16} /> {tt.generate}
              </button>
              {reachableResults.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setFmtInput(reachableResults.map((r) => r.host).join('\n'))}
                >
                  {tt.fmtFromScan}
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={fmtClear}>
                {tt.clear}
              </button>
              <span className="tool-stats">
                <strong>{fmtHostCount}</strong> {tt.ipCount}, <strong>{fmtOutLines}</strong> {tt.outLines}
              </span>
            </div>

            <div className="tool-mini-label" style={{ marginTop: '16px' }}>{tt.outputLabel}</div>
            <pre className="tool-output" dir="ltr" tabIndex={0}>
              {fmtOut}
            </pre>
            {fmtGenerated && !fmtOut && <div className="tool-hint">{tt.empty}</div>}
            <div className="tool-actions">
              <button type="button" className="btn btn-primary" onClick={fmtCopy} disabled={!fmtOut}>
                <Icon name={fmtCopied ? 'check' : 'copy'} size={16} /> {fmtCopied ? tt.copied : tt.copy}
              </button>
              <button type="button" className="mini-btn" onClick={fmtDownload} disabled={!fmtOut}>
                <Icon name="download" size={14} /> {tt.buildDownload}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setFmtOut('')
                  setFmtGenerated(false)
                }}
              >
                {tt.clearOutput}
              </button>
            </div>
            <div className="tool-hint">{tt.hint}</div>
          </div>
        )}

        {/* ============================= BUILD ============================ */}
        {tab === 'build' && (
        <div className="tool-card">
          <div className="tool-label">{tt.buildTitle}</div>
          <p className="tool-sub">{tt.buildIntro}</p>

          <div className="import-row">
            <span className="build-field-label">{tt.importLabel}</span>
            <div className="uuid-row">
              <input
                type="text"
                dir="ltr"
                value={importLink}
                onChange={(e) => {
                  setImportLink(e.target.value)
                  if (importErr) setImportErr(false)
                }}
                placeholder="vless://…    vmess://…    trojan://…"
                spellCheck="false"
              />
              <button type="button" className="mini-btn" onClick={importConfig} disabled={!importLink.trim()}>
                <Icon name="download" size={14} /> {tt.importBtn}
              </button>
            </div>
            <div className={`tool-hint${importErr ? ' import-err' : ''}`}>
              {importErr ? tt.importBad : tt.importHint}
            </div>
          </div>

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

          <div className="tool-mini-label" style={{ marginTop: '16px' }}>{tt.portsLabel}</div>
          {renderPorts()}

          <label className="build-field build-wide" style={{ marginTop: '16px' }}>
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
                  {qrLinks.length > 0 && (
                    <button type="button" className="mini-btn" onClick={() => setShowQR((v) => !v)}>
                      <Icon name="app" size={14} /> {showQR ? tt.qrHide : tt.qrShow}
                    </button>
                  )}
                </span>
              </div>
              <pre className="tool-output" dir="ltr" tabIndex={0}>
                {builderOut}
              </pre>
              {showQR && qrLinks.length > 0 && (
                <div className="qr-area">
                  <div className="qr-grid">
                    {qrLinks.map((link, i) => (
                      <div className="qr-card" key={i}>
                        <QrSvg text={link} />
                        <span className="qr-name">Nova-{i + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="tool-hint">{tt.qrNote}</div>
                </div>
              )}
            </div>
          )}

          <div className="tool-hint">{tt.buildNote}</div>
        </div>
        )}

        {/* ============================= SPEED ============================ */}
        {tab === 'speed' && (
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
              {chk.avgMs !== undefined && (
                <span className="check-latency">
                  {tt.chkLatency}: <strong>{chk.avgMs} ms</strong>, {chk.label}
                </span>
              )}
              {chk.mbps != null && (
                <span className="check-latency">
                  {tt.chkDownload}: <strong>{chk.mbps.toFixed(1)} Mbps</strong>
                </span>
              )}
            </div>
          )}
          <div className="tool-hint">{tt.chkNote}</div>
        </div>
        )}

        <p className="tool-credit">
          {tt.creditPre}
          <a href="https://t.me/survivorv" target="_blank" rel="noreferrer noopener">
            Reza_Gm
          </a>
          {tt.creditPost}
        </p>
      </div>
    </div>
  )
}
