import { navigate } from './lib/navigation'
import { useEffect, useState } from 'react'
import { api, getSession, saveSession } from './lib/api'
import { Link, Notice } from './components/UI'
import { authRoutes, navigation } from './lib/routes'
import AppLayout from './components/layout/AppLayout'
import EmptyState from './components/ui/EmptyState'
import LoadingState from './components/ui/LoadingState'
import Auth from './pages/Auth'
import Overview from './pages/Overview'
import Settings from './pages/Settings'
import ApiKeys from './pages/ApiKeys'
import AdminUsers from './pages/AdminUsers'

export default function App() {
  const [path, setPath] = useState(
    window.location.pathname.replace(/\/$/, '') || '/',
  )
  const [session, setSession] = useState(getSession)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const authMode = authRoutes[path]
  useEffect(() => {
    const onPath = () => {
      setPath(window.location.pathname.replace(/\/$/, '') || '/')
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
  const page = navigation.find((item) => item.path === path)
  return (
    <AppLayout
      path={path}
      user={user}
      title={page?.label || 'Page'}
      onSignOut={signOut}
    >
      {!user ? (
        error ? (
          <div className="loading-panel">
            <Notice>{error}</Notice>
            <button
              className="btn btn-primary"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <LoadingState className="loading-panel" label="Loading your account">
            <p className="text-secondary mt-3">Getting your space ready…</p>
          </LoadingState>
        )
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
      ) : path === '/admin/users' ? (
        user.role === 'admin' ? (
          <AdminUsers currentUser={user} setCurrentUser={setUser} />
        ) : (
          <EmptyState
            icon="shield-lock"
            heading="h1"
            title="Admin access required."
            action={
              <Link className="btn btn-primary" to="/overview">
                Back to your workspace
              </Link>
            }
          >
            Only administrators can manage user accounts.
          </EmptyState>
        )
      ) : (
        <EmptyState
          heading="h1"
          title="A little off track."
          action={
            <Link className="btn btn-primary" to="/overview">
              Back to your workspace
            </Link>
          }
        >
          We couldn’t find this page.
        </EmptyState>
      )}
    </AppLayout>
  )
}
