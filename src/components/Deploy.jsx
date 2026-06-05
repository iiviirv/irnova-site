import { useEffect } from 'react'
import Icon from './Icon.jsx'
import Nav from './Nav.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

const AUTO_URL = 'https://nova-deploy.pages.dev'
const ONECLICK_URL =
  'https://deploy.workers.cloudflare.com/?url=https://github.com/iiviirv/nova-proxy-worker'

// Deploy sub-page (#/deploy). Reuses the site's section / card / button styles so
// it matches the landing page in both light and dark, EN and FA.
export default function Deploy() {
  const { t } = useLang()
  const d = t.deploy

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="app">
      <Nav />
      <main>
        <section className="section" style={{ paddingTop: '3.2rem' }}>
          <div className="section-head">
            <span className="eyebrow">{d.eyebrow}</span>
            <h2>
              {d.title} <span className="grad">{d.titleAccent}</span>
            </h2>
            <p>{d.sub}</p>
          </div>

          <div className="deploy-grid">
            <div className="cap-card deploy-card">
              <span className="cap-icon">
                <Icon name="cloud" size={22} />
              </span>
              <span className="pill deploy-pill">{d.opt1Tag}</span>
              <h3>{d.opt1Title}</h3>
              <p>{d.opt1Text}</p>
              <a
                className="btn btn-primary deploy-btn"
                href={AUTO_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                {d.opt1Cta} <Icon name="arrow" size={16} className="icon-arrow" />
              </a>
            </div>

            <div className="cap-card deploy-card">
              <span className="cap-icon">
                <Icon name="globe" size={22} />
              </span>
              <span className="pill deploy-pill">{d.opt2Tag}</span>
              <h3>{d.opt2Title}</h3>
              <p>{d.opt2Text}</p>
              <a
                className="btn btn-ghost deploy-btn"
                href={ONECLICK_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                {d.opt2Cta}
              </a>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="section-head">
            <h2>{d.stepsTitle}</h2>
          </div>
          <ol className="deploy-steps">
            {d.steps.map((s, i) => (
              <li key={i}>
                <span className="deploy-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
