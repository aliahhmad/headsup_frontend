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
        {items.map((item) => {
          const active = path === item.path || path.startsWith(`${item.path}/`)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${active ? 'active' : ''}`}
              aria-current={
                active ? (path === item.path ? 'page' : 'location') : undefined
              }
            >
              <Icon name={item.icon} />
              {item.label}
              {active && <span className="nav-active-dot" />}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
