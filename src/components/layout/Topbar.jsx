import Icon from '../ui/Icon'
import NotificationBell from '../notifications/NotificationBell'

export default function Topbar({ user, title, menuOpen, onOpenMenu, onSignOut }) {
  return (
    <header className="app-topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn icon-button d-lg-none"
          onClick={() => onOpenMenu()}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <Icon name="list" />
        </button>
        <span className="breadcrumb-root">My workspace</span>
        <Icon name="chevron-right" />
        <span>{title}</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        {user && <NotificationBell key={user.id} />}
        <button className="btn signout-button" onClick={onSignOut}>
          <Icon name="box-arrow-right" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}
