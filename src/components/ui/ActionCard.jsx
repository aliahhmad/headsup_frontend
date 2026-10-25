import Icon from './Icon'
import Link from './Link'

export default function ActionCard({
  to,
  icon,
  title,
  children,
  action,
  tone = 'tone-blue',
}) {
  return (
    <Link to={to} className="card setup-card h-100">
      <span className={`tile-icon ${tone}`}>
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      <span className="card-action">
        {action}
        <Icon name="arrow-up-right" />
      </span>
    </Link>
  )
}
