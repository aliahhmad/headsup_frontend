import { useEffect, useState } from 'react'
import { api, getSession, saveSession } from './lib/api'
import { Brand, Icon, Link, navigate, Notice } from './components/UI'
import Auth from './pages/Auth'
import Overview from './pages/Overview'
import Settings from './pages/Settings'
import ApiKeys from './pages/ApiKeys'

const authRoutes = {
  '/': 'login',
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgot',
  '/reset-password': 'reset',
  '/verify': 'verify',
}
const navigation = [
  { path: '/overview', label: 'Overview', icon: 'grid-1x2' },
  { path: '/profile', label: 'My profile', icon: 'person' },
  { path: '/security', label: 'Security', icon: 'shield-check' },
  { path: '/api-keys', label: 'API keys', icon: 'key' },
]

export default function App() {
  const [path, setPath] = useState(
    window.location.pathname.replace(/\/$/, '') || '/',
  )
  const [session, setSession] = useState(getSession)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const authMode = authRoutes[path]
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        document.querySelector('[aria-label="Open navigation"]')?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])
  useEffect(() => {
    const onPath = () => {
      setPath(window.location.pathname.replace(/\/$/, '') || '/')
      setMenuOpen(false)
    }
    const onSession = () => {
      setSession(getSession())
      setUser(null)
    }
    window.addEventListener('popstate', onPath)
    window.addEventListener('headsup:session', onSession)
    return () => {
      window.removeEventListener('popstate', onPath)
      window.removeEventListener('headsup:session', onSession)
    }
  }, [])
  useEffect(() => {
    let active = true
    if (session)
      api('/users/me')
        .then((data) => {
          if (active) {
            setUser(data)
            setError('')
          }
        })
        .catch((err) => {
          if (active) setError(err.message)
        })
    return () => {
      active = false
    }
  }, [session, retry])
  useEffect(() => {
    if (session && ['/', '/login', '/register'].includes(path))
      navigate('/overview')
    if (!session && !authMode) navigate('/login')
    const label =
      navigation.find((item) => item.path === path)?.label ||
      {
        register: 'Create account',
        forgot: 'Reset password',
        reset: 'New password',
        verify: 'Verify email',
      }[authMode] ||
      'Sign in'
    document.title = `${label} · HeadsUp`
  }, [session, path, authMode])
  if (authMode && !(session && ['/', '/login', '/register'].includes(path)))
    return <Auth key={`${path}${window.location.search}`} mode={authMode} />
  if (!session) return null
  function signOut() {
    saveSession(null)
    setError('')
    navigate('/login')
  }
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
    : '…'
  const page = navigation.find((item) => item.path === path)
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="btn icon-button d-lg-none"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <Icon name="x-lg" />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-dot" />
          Your personal space
        </div>
        <p className="nav-section-label">WORKSPACE</p>
        <nav aria-label="Main navigation" className="nav flex-column">
          {navigation.map((item) => (
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
          <button
            className="profile-switch"
            onClick={() => navigate('/profile')}
          >
            <span className="avatar">{initials}</span>
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
      {menuOpen && (
        <button
          className="sidebar-backdrop d-lg-none"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="app-content">
        <header className="app-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn icon-button d-lg-none"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={menuOpen}
            >
              <Icon name="list" />
            </button>
            <span className="breadcrumb-root">My workspace</span>
            <Icon name="chevron-right" />
            <span>{page?.label || 'Page'}</span>
          </div>
          <button className="btn signout-button" onClick={signOut}>
            <Icon name="box-arrow-right" />
            <span>Sign out</span>
          </button>
        </header>
        <main className="workspace-main" id="main-content">
          {!user ? (
            <div className="loading-panel">
              {error ? (
                <>
                  <Notice>{error}</Notice>
                  <button
                    className="btn btn-primary"
                    onClick={() => setRetry(retry + 1)}
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <span className="spinner-border text-success" role="status">
                    <span className="visually-hidden">
                      Loading your account
                    </span>
                  </span>
                  <p className="text-secondary mt-3">
                    Getting your space ready…
                  </p>
                </>
              )}
            </div>
          ) : path === '/overview' ? (
            <Overview user={user} />
          ) : ['/profile', '/security'].includes(path) ? (
            <Settings
              key={path}
              user={user}
              setUser={setUser}
              security={path === '/security'}
            />
          ) : path === '/api-keys' ? (
            <ApiKeys />
          ) : (
            <div className="empty-state">
              <h1>A little off track.</h1>
              <p>We couldn’t find this page.</p>
              <Link className="btn btn-primary" to="/overview">
                Back to your workspace
              </Link>
            </div>
          )}
        </main>
        <footer className="workspace-footer">
          <span>© {new Date().getFullYear()} HeadsUp</span>
          <span>
            Mindful of your attention.
            <Icon name="asterisk" />
          </span>
        </footer>
      </div>
    </div>
  )
}
