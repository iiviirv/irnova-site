import Icon from './Icon.jsx'

function formatStars(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
}

export default function ProjectCard({ project }) {
  const { name, tagline, description, language, stars, url, tags, featured } = project
  return (
    <a
      className={`project-card${featured ? ' is-featured' : ''}`}
      href={url}
      target="_blank"
      rel="noreferrer noopener"
    >
      {featured && <span className="project-badge">Flagship</span>}
      <div className="project-head">
        <h3>{name}</h3>
        <span className="project-stars">
          <Icon name="star" size={15} />
          {formatStars(stars)}
        </span>
      </div>
      <p className="project-tagline">{tagline}</p>
      <p className="project-desc">{description}</p>
      <div className="project-tags">
        {tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <div className="project-foot">
        <span className="project-lang">
          <span className="lang-dot" /> {language}
        </span>
        <span className="project-link">
          View on GitHub <Icon name="arrow" size={16} />
        </span>
      </div>
    </a>
  )
}
