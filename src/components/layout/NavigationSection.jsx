import { Icon, Link } from '../UI'

export default function NavigationSection({
  label,
  ariaLabel,
  items,
  path,
  className = '',
}) {
  return (
    <>
      <p className={`nav-section-label ${className}`}>{label}</p>
      <nav aria-label={ariaLabel} className="nav flex-column">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${path === item.path ? 'active' : ''}`}
            aria-current={path === item.path ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            {item.label}
            {path === item.path && <span className="nav-active-dot" />}
          </Link>
        ))}
      </nav>
    </>
  )
}
