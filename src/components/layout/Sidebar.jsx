import { Brand, Icon } from '../UI'
import Avatar from '../ui/Avatar'
import { navigate } from '../../lib/navigation'
import { navigation } from '../../lib/routes'
import NavigationSection from './NavigationSection'

export default function Sidebar({ path, user, menuOpen, onClose }) {
  return (
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
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
      <NavigationSection
        label="WORKSPACE"
        ariaLabel="Main navigation"
        items={navigation.filter((item) => !item.admin)}
        path={path}
      />
      {user?.role === 'admin' && (
        <NavigationSection
          label="ADMINISTRATION"
          ariaLabel="Administration"
          items={navigation.filter((item) => item.admin)}
          path={path}
          className="mt-4"
        />
      )}
      <div className="sidebar-bottom">
        <div className="quiet-card">
          <Icon name="cup-hot" />
          <strong>A little peace of mind.</strong>
          <p>
            Less checking.
            <br />
            More living.
          </p>
          <span>THAT’S THE IDEA.</span>
        </div>
        <button className="profile-switch" onClick={() => navigate('/profile')}>
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
