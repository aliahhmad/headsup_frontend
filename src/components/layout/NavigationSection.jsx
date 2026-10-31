import { Icon, Link } from '../UI'

function NavigationLinks({ items, path }) {
  return items.map((item) => {
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
  })
}

export default function NavigationSection({
  label,
  ariaLabel,
  icon,
  description,
  groups,
  items,
  path,
  className = '',
}) {
  return (
    <div className={`sidebar-section ${className}`}>
      <div className="nav-section-heading">
        {icon && <span className="nav-section-icon"><Icon name={icon} /></span>}
        <div>
          <p className="nav-section-label">{label}</p>
          {description && <p className="nav-section-description">{description}</p>}
        </div>
      </div>
      <nav aria-label={ariaLabel} className={groups ? 'nav-groups' : 'nav flex-column'}>
        {groups ? groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group.id)
          if (!groupItems.length) return null
          const headingId = `nav-${group.id}`
          return (
            <div key={group.id} className="nav-group" role="group" aria-labelledby={headingId}>
              <p id={headingId} className="nav-group-label">{group.label}</p>
              <div className="nav flex-column">
                <NavigationLinks items={groupItems} path={path} />
              </div>
            </div>
          )
        }) : <NavigationLinks items={items} path={path} />}
      </nav>
    </div>
  )
}
