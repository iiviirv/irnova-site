import NetworkBackground from './components/NetworkBackground.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import Icon from './components/Icon.jsx'
import { projects, capabilities } from './data/projects.js'

const GITHUB = 'https://github.com/IRNova'

function Logo() {
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
      <span className="logo-text">IRNova</span>
    </span>
  )
}

export default function App() {
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0)
  const stats = [
    { value: `${(totalStars / 1000).toFixed(1)}k+`, label: 'GitHub Stars' },
    { value: projects.length, label: 'Open Projects' },
    { value: 'Go · React', label: 'Built With' },
    { value: '100%', label: 'Open Source' },
  ]

  return (
    <div className="app">
      <header className="nav">
        <Logo />
        <nav className="nav-links">
          <a href="#projects">Projects</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#about">About</a>
          <a className="nav-cta" href={GITHUB} target="_blank" rel="noreferrer noopener">
            <Icon name="github" size={18} /> GitHub
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <NetworkBackground />
          <div className="hero-inner">
            <span className="pill">Open-source networking tools</span>
            <h1>
              Keep the internet
              <span className="grad"> open, fast, and reachable.</span>
            </h1>
            <p className="hero-sub">
              IRNova builds a suite of open-source proxy and networking tools — engineered to
              slip past filtering, find the cleanest routes, and deliver reliable connectivity on
              every platform.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#projects">
                Explore Projects <Icon name="arrow" size={18} />
              </a>
              <a className="btn btn-ghost" href={GITHUB} target="_blank" rel="noreferrer noopener">
                <Icon name="github" size={18} /> Follow on GitHub
              </a>
            </div>
            <div className="stats">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-head">
            <span className="eyebrow">The toolkit</span>
            <h2>Projects</h2>
            <p>
              Four open-source projects that work together — from a full control panel to a
              low-level proxy engine and an IP scanner that proves what actually works.
            </p>
          </div>
          <div className="project-grid">
            {projects.map((p) => (
              <ProjectCard key={p.name} project={p} />
            ))}
          </div>
        </section>

        <section id="capabilities" className="section section-alt">
          <div className="section-head">
            <span className="eyebrow">Under the hood</span>
            <h2>Capabilities</h2>
            <p>
              The techniques behind the Nova toolchain — built to stay reliable in hostile network
              conditions.
            </p>
          </div>
          <div className="cap-grid">
            {capabilities.map((c) => (
              <div className="cap-card" key={c.title}>
                <span className="cap-icon">
                  <Icon name={c.icon} size={22} />
                </span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="section">
          <div className="about">
            <div className="about-copy">
              <span className="eyebrow">About</span>
              <h2>Built in the open by IRNova</h2>
              <p>
                IRNova is a developer focused on connectivity and circumvention tooling. Every
                project is shipped openly on GitHub — auditable, free to run, and shaped by a
                community that depends on an open internet.
              </p>
              <p>
                Written primarily in Go and React, the tools favor real-world reliability:
                two-phase endpoint verification, intelligent routing, and a steady stream of
                techniques to stay ahead of filtering.
              </p>
              <a className="btn btn-primary" href={GITHUB} target="_blank" rel="noreferrer noopener">
                <Icon name="github" size={18} /> Visit the GitHub profile
              </a>
            </div>
            <div className="about-card">
              <div className="about-card-head">
                <Logo />
                <a href={GITHUB} target="_blank" rel="noreferrer noopener" className="about-handle">
                  @IRNova
                </a>
              </div>
              <ul className="about-list">
                <li>
                  <Icon name="route" size={18} /> Proxy & routing infrastructure
                </li>
                <li>
                  <Icon name="radar" size={18} /> Network scanning & verification
                </li>
                <li>
                  <Icon name="shield" size={18} /> Anti-censorship techniques
                </li>
                <li>
                  <Icon name="open" size={18} /> Fully open source
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Logo />
        <p className="footer-note">
          Open-source networking tools. Built for an open internet.
        </p>
        <div className="footer-links">
          <a href="#projects">Projects</a>
          <a href="#capabilities">Capabilities</a>
          <a href={GITHUB} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} IRNova</span>
      </footer>
    </div>
  )
}
