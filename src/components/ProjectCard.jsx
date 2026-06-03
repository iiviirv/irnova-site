import Icon from './Icon.jsx'
import { useLang } from '../i18n/LanguageContext.jsx'

function formatStars(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
}

export default function ProjectCard({ project }) {
  const { t, lang } = useLang()
  const { name, tagline, description, language, stars, url, tags, featured } = project
  return (
    <a
      className={`project-card${featured ? ' is-featured' : ''}`}
      href={url}
      target="_blank"
      rel="noreferrer noopener"
    >
      <div className="project-head">
        <div className="project-title-wrap">
          <h3>{name}</h3>
          {featured && <span className="project-badge">{t.flagship}</span>}
        </div>
        <span className="project-stars">
          <Icon name="star" size={15} />
          {formatStars(stars)}
        </span>
      </div>
      <p className="project-tagline">{tagline[lang]}</p>
      <p className="project-desc">{description[lang]}</p>
      <div className="project-tags">
        {tags[lang].map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="project-foot">
        <span className="project-lang">
          <span className="lang-dot" /> {language}
        </span>
        <span className="project-link">
          {t.viewOnGithub} <Icon name="arrow" size={16} className="icon-arrow" />
        </span>
      </div>
    </a>
  )
}
