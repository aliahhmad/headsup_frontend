import { Brand, Icon } from '../UI'
import Avatar from '../ui/Avatar'
import { navigate } from '../../lib/navigation'
import { navigation, navigationSections } from '../../lib/routes'
import NavigationSection from './NavigationSection'

export default function Sidebar({ path, user, menuOpen, onClose }) {
  return (
    <aside
      className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}
      aria-label="Workspace sidebar"
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Brand />
          <button
            className="btn icon-button d-lg-none"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <Icon name="x-lg" />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-dot" />
          Your personal space
        </div>
      </div>
      <div
        className="sidebar-scroll"
        tabIndex={0}
        role="region"
        aria-label="Scrollable sidebar navigation"
      >
        {navigationSections.map((section) => {
          const items = navigation.filter(
            (item) =>
              item.sidebar !== false &&
              item.section === section.id &&
              (!item.admin || user?.role === 'admin'),
          )
          if (!items.length) return null
          return (
            <NavigationSection
              key={section.id}
              label={section.label}
              ariaLabel={section.ariaLabel}
              icon={section.icon}
              description={section.description}
              groups={section.groups}
              className={`sidebar-section-${section.id}`}
              items={items}
              path={path}
            />
          )
        })}
        <div className="quiet-card">
          <Icon name="cup-hot" />
          <div>
            <strong>A little more headspace.</strong>
            <p>Less checking. More living.</p>
          </div>
        </div>
      </div>
      <div className="sidebar-account">
        <button
          type="button"
          className="profile-switch"
          onClick={() => navigate('/profile')}
        >
          <Avatar user={user} />
          <span className="profile-switch-text">
            <strong>
              {user?.first_name || 'Your account'} {user?.last_name}
            </strong>
            <small>Personal account</small>
          </span>
          <Icon name="chevron-right" />
        </button>
      </div>
    </aside>
  )
}
