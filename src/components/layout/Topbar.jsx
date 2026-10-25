import Icon from '../ui/Icon'

export default function Topbar({ title, menuOpen, onOpenMenu, onSignOut }) {
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
      <button className="btn signout-button" onClick={onSignOut}>
        <Icon name="box-arrow-right" />
        <span>Sign out</span>
      </button>
    </header>
  )
}
