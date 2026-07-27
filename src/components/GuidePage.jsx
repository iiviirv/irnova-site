import { useEffect, useMemo, useRef, useState } from 'react'
import Nav from './Nav.jsx'
import Icon from './Icon.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'
import proxyMd from '../guides/nova-proxy.md?raw'
import serverMd from '../guides/nova-server.md?raw'
import './GuidePage.css'

// ---------------------------------------------------------------------------
// Markdown -> block model
// ---------------------------------------------------------------------------
// The guides are trusted Farsi markdown that also embed a small amount of raw
// HTML (FAQ <details>, and inline <b>/<code>). We parse into a block tree and
// render each block as React nodes, so all *text* is escaped by React and only
// a whitelist of inline tags (<b>, <code>) plus the <details> FAQ structure is
// honoured. Invisible bidi-isolate chars (U+2066/U+2069) are ordinary text and
// flow through untouched, keeping mixed Farsi/English readable.

const BIDI = /[⁦-⁩]/g
const stripBidi = (s) => s.replace(BIDI, '')

// Parse a run of markdown text into an ordered list of blocks. `ids` is a
// shared counter object so section/faq ids stay stable across TOC, search and
// render (all built from the same model).
function parseBlocks(md, ids) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  const isSpecial = (l) => {
    const t = l.trim()
    return (
      t.startsWith('```') ||
      t.startsWith('<details') ||
      t === '---' ||
      /^#{1,6}\s/.test(t) ||
      /^-\s/.test(t) ||
      /^\d+\.\s/.test(t)
    )
  }

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    if (t === '') {
      i++
      continue
    }

    // Fenced code block
    if (t.startsWith('```')) {
      const lang = t.slice(3).trim()
      const buf = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i])
        i++
      }
      i++ // consume closing fence
      blocks.push({ type: 'code', lang, code: buf.join('\n') })
      continue
    }

    // FAQ <details> ... </details>
    if (t.startsWith('<details')) {
      const buf = []
      while (i < lines.length) {
        buf.push(lines[i])
        if (lines[i].trim().startsWith('</details>')) {
          i++
          break
        }
        i++
      }
      const raw = buf.join('\n')
      const sumMatch = raw.match(/<summary>([\s\S]*?)<\/summary>/i)
      const q = sumMatch ? sumMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      const bodyRaw = raw
        .replace(/[\s\S]*?<\/summary>/i, '')
        .replace(/<\/details>\s*$/i, '')
        .trim()
      const id = `faq-${ids.faq++}`
      blocks.push({ type: 'faq', id, q, body: parseBlocks(bodyRaw, ids) })
      continue
    }

    // Horizontal rule
    if (t === '---') {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Headings
    const h = t.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      const text = h[2].trim()
      if (level === 1) {
        blocks.push({ type: 'h1', text })
      } else {
        // Treat every sub-heading as a navigable section.
        const id = `sec-${ids.sec++}`
        blocks.push({ type: 'h2', id, text })
      }
      i++
      continue
    }

    // Unordered list
    if (/^-\s/.test(t)) {
      const items = []
      while (i < lines.length && /^-\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^-\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(t)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // Paragraph: gather consecutive plain lines. Single newlines are kept as
    // soft breaks so the guides' step-style line groups stay readable.
    const para = []
    while (i < lines.length && lines[i].trim() !== '' && !isSpecial(lines[i])) {
      para.push(lines[i].trim())
      i++
    }
    blocks.push({ type: 'p', lines: para })
  }

  return blocks
}

function parseGuide(md) {
  const ids = { sec: 0, faq: 0 }
  const blocks = parseBlocks(md, ids)
  const sections = []
  const faqs = []
  const walk = (bl) => {
    for (const b of bl) {
      if (b.type === 'h2') sections.push({ id: b.id, text: b.text })
      if (b.type === 'faq') {
        faqs.push({ id: b.id, text: b.q })
        walk(b.body)
      }
    }
  }
  walk(blocks)
  return { blocks, sections, faqs }
}

// ---------------------------------------------------------------------------
// Inline renderer (whitelist: <code>, <b>, `code`, **bold**, bare URLs)
// ---------------------------------------------------------------------------
const INLINE_SRC =
  '<code>([\\s\\S]*?)<\\/code>|`([^`]+)`|<b>([\\s\\S]*?)<\\/b>|\\*\\*([\\s\\S]*?)\\*\\*|(https?:\\/\\/[^\\s<)]+)'

function renderInline(text, keyBase) {
  const nodes = []
  let last = 0
  let m
  let n = 0
  // A fresh regex per call: renderInline recurses (bold contents), and a shared
  // stateful /g regex would have its lastIndex clobbered by the inner call.
  const re = new RegExp(INLINE_SRC, 'g')
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const key = `${keyBase}-${n++}`
    if (m[1] !== undefined) {
      nodes.push(
        <code key={key} className="gd-inline-code" dir="ltr">
          {m[1]}
        </code>,
      )
    } else if (m[2] !== undefined) {
      nodes.push(
        <code key={key} className="gd-inline-code" dir="ltr">
          {m[2]}
        </code>,
      )
    } else if (m[3] !== undefined) {
      nodes.push(<b key={key}>{renderInline(m[3], key)}</b>)
    } else if (m[4] !== undefined) {
      nodes.push(<b key={key}>{renderInline(m[4], key)}</b>)
    } else if (m[5] !== undefined) {
      // Trim trailing punctuation that shouldn't belong to the link.
      let url = m[5]
      let trail = ''
      const tm = url.match(/[.,،؛:)]+$/)
      if (tm) {
        trail = tm[0]
        url = url.slice(0, -trail.length)
      }
      nodes.push(
        <a
          key={key}
          className="gd-link"
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          dir="ltr"
        >
          {url}
        </a>,
      )
      if (trail) nodes.push(trail)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

// Join a paragraph's soft-wrapped lines with <br/>.
function renderParagraph(lines, keyBase) {
  const out = []
  lines.forEach((ln, idx) => {
    if (idx > 0) out.push(<br key={`${keyBase}-br-${idx}`} />)
    out.push(<span key={`${keyBase}-l-${idx}`}>{renderInline(ln, `${keyBase}-${idx}`)}</span>)
  })
  return out
}

// ---------------------------------------------------------------------------
// Copy-able code block
// ---------------------------------------------------------------------------
function CodeBlock({ code, lang, labels }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className="gd-codeblock">
      <div className="gd-codeblock-top" dir="ltr">
        <span className="gd-code-lang">{lang || 'bash'}</span>
        <button type="button" className="gd-copy" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={13} />
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
      <pre className="gd-pre" dir="ltr" tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------
function Blocks({ blocks, openFaq, onFaqToggle, labels }) {
  return blocks.map((b, idx) => {
    const key = `b-${idx}`
    switch (b.type) {
      case 'h1':
        return (
          <h1 key={key} className="gd-h1">
            {renderInline(b.text, key)}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={key} id={b.id} className="gd-h2">
            {renderInline(b.text, key)}
          </h2>
        )
      case 'p':
        return (
          <p key={key} className="gd-p">
            {renderParagraph(b.lines, key)}
          </p>
        )
      case 'ul':
        return (
          <ul key={key} className="gd-list">
            {b.items.map((it, j) => (
              <li key={j}>{renderInline(it, `${key}-${j}`)}</li>
            ))}
          </ul>
        )
      case 'ol':
        return (
          <ol key={key} className="gd-list gd-list-ol">
            {b.items.map((it, j) => (
              <li key={j}>{renderInline(it, `${key}-${j}`)}</li>
            ))}
          </ol>
        )
      case 'hr':
        return <hr key={key} className="gd-hr" />
      case 'code':
        return <CodeBlock key={key} code={b.code} lang={b.lang} labels={labels} />
      case 'faq':
        return (
          <details
            key={key}
            id={b.id}
            className="gd-faq"
            open={openFaq.has(b.id)}
            onToggle={(e) => onFaqToggle(b.id, e.currentTarget.open)}
          >
            <summary className="gd-faq-q">
              <span>{renderInline(b.q, `${key}-q`)}</span>
              <Icon name="chevron" size={18} className="gd-faq-caret" />
            </summary>
            <div className="gd-faq-a">
              <Blocks
                blocks={b.body}
                openFaq={openFaq}
                onFaqToggle={onFaqToggle}
                labels={labels}
              />
            </div>
          </details>
        )
      default:
        return null
    }
  })
}

// ---------------------------------------------------------------------------
// Table of contents list (shared by the desktop rail + mobile disclosure)
// ---------------------------------------------------------------------------
function TocList({ sections, activeId, onGo }) {
  return (
    <ul className="gd-toc-list">
      {sections.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            className={`gd-toc-link${activeId === s.id ? ' active' : ''}`}
            onClick={() => onGo(s.id)}
          >
            {s.text}
          </button>
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const GUIDES = {
  proxy: proxyMd,
  server: serverMd,
}

export default function GuidePage() {
  const { t } = useLang()
  const g = t.guidePage
  const labels = { copy: g.copy, copied: g.copied }

  const [track, setTrack] = useState('proxy')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(() => new Set())
  const [activeId, setActiveId] = useState(null)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  const searchWrapRef = useRef(null)

  const model = useMemo(() => parseGuide(GUIDES[track]), [track])

  // Reset per-guide state when the active guide changes.
  useEffect(() => {
    setOpenFaq(new Set())
    setQuery('')
    setSearchOpen(false)
    setActiveId(model.sections[0]?.id ?? null)
  }, [track]) // eslint-disable-line react-hooks/exhaustive-deps

  // Land at the top when the page mounts.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Search index = sections + FAQ questions of the active guide.
  const results = useMemo(() => {
    const q = stripBidi(query).trim().toLowerCase()
    if (!q) return []
    const hay = [
      ...model.sections.map((s) => ({ ...s, kind: 'section' })),
      ...model.faqs.map((f) => ({ ...f, kind: 'faq' })),
    ]
    return hay.filter((it) => stripBidi(it.text).toLowerCase().includes(q)).slice(0, 12)
  }, [query, model])

  function onFaqToggle(id, isOpen) {
    setOpenFaq((prev) => {
      const next = new Set(prev)
      if (isOpen) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function goTo(id, { openIfFaq = false } = {}) {
    if (openIfFaq && id.startsWith('faq-')) {
      setOpenFaq((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }
    // Wait a tick so a just-opened FAQ has expanded before we scroll.
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 20)
  }

  function pickResult(r) {
    setSearchOpen(false)
    goTo(r.id, { openIfFaq: true })
  }

  function onSearchKey(e) {
    if (e.key === 'Enter' && results.length) {
      e.preventDefault()
      pickResult(results[0])
    } else if (e.key === 'Escape') {
      setSearchOpen(false)
    }
  }

  // Close the search dropdown on outside click.
  useEffect(() => {
    function onDoc(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // Highlight the section currently under the header while scrolling.
  useEffect(() => {
    let raf = 0
    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        let current = model.sections[0]?.id ?? null
        for (const s of model.sections) {
          const el = document.getElementById(s.id)
          if (el && el.getBoundingClientRect().top <= 140) current = s.id
          else break
        }
        setActiveId(current)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [model])

  const tracks = [
    { id: 'proxy', label: g.proxyLabel, tagline: g.proxyTagline, icon: 'bolt' },
    { id: 'server', label: g.serverLabel, tagline: g.serverTagline, icon: 'route' },
  ]

  return (
    <div className="guide-page">
      <Nav />

      <div className="gd-shell">
        <header className="gd-hero">
          <span className="eyebrow gd-eyebrow">
            <Icon name="book" size={14} /> {g.eyebrow}
          </span>
          <h1 className="gd-title">
            {g.title} <span className="grad">{g.titleAccent}</span>
          </h1>
          <p className="gd-subtitle">{g.subtitle}</p>

          {/* Segmented switcher */}
          <div className="gd-switcher" role="tablist" aria-label={g.eyebrow}>
            {tracks.map((tr) => (
              <button
                key={tr.id}
                type="button"
                role="tab"
                aria-selected={track === tr.id}
                className={`gd-seg${track === tr.id ? ' active' : ''}`}
                onClick={() => setTrack(tr.id)}
              >
                <Icon name={tr.icon} size={16} />
                <span className="gd-seg-text">
                  <span className="gd-seg-label">{tr.label}</span>
                  <span className="gd-seg-tag">{tr.tagline}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="gd-search-wrap" ref={searchWrapRef} dir="rtl">
            <div className="gd-search">
              <Icon name="search" size={18} className="gd-search-icon" />
              <input
                type="text"
                className="gd-search-input"
                dir="auto"
                value={query}
                placeholder={g.searchPlaceholder}
                aria-label={g.searchLabel}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={onSearchKey}
              />
              {query && (
                <button
                  type="button"
                  className="gd-search-clear"
                  aria-label="Clear"
                  onClick={() => {
                    setQuery('')
                    setSearchOpen(false)
                  }}
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            {searchOpen && query && (
              <div className="gd-results" role="listbox">
                {results.length === 0 ? (
                  <div className="gd-result-empty">{g.noResults}</div>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      role="option"
                      className="gd-result"
                      onClick={() => pickResult(r)}
                    >
                      <span className={`gd-result-tag gd-tag-${r.kind}`}>
                        {r.kind === 'faq' ? g.faqTag : g.sectionTag}
                      </span>
                      <span className="gd-result-text">{r.text}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </header>

        <div className="gd-layout" dir="rtl">
          {/* Sticky rail (desktop) */}
          <aside className="gd-rail" aria-label={g.toc}>
            <div className="gd-rail-inner">
              <span className="gd-rail-title">{g.toc}</span>
              <TocList sections={model.sections} activeId={activeId} onGo={goTo} />
            </div>
          </aside>

          <main className="gd-main">
            {/* Collapsible TOC (mobile) */}
            <details
              className="gd-toc-mobile"
              open={mobileTocOpen}
              onToggle={(e) => setMobileTocOpen(e.currentTarget.open)}
            >
              <summary>
                <span>{g.toc}</span>
                <Icon name="chevron" size={16} className="gd-faq-caret" />
              </summary>
              <TocList
                sections={model.sections}
                activeId={activeId}
                onGo={(id) => {
                  setMobileTocOpen(false)
                  goTo(id)
                }}
              />
            </details>

            <article className="gd-body">
              <Blocks
                blocks={model.blocks}
                openFaq={openFaq}
                onFaqToggle={onFaqToggle}
                labels={labels}
              />
            </article>
          </main>
        </div>
      </div>
    </div>
  )
}
