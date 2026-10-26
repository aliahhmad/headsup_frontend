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
import AdminSignupSettings from './pages/AdminSignupSettings'
import Home from './pages/Home'
import ServiceStatusBanner from './components/ServiceStatusBanner'
import Monitors from './pages/Monitors'
import CreateMonitor from './pages/CreateMonitor'
import MonitorDetail from './pages/MonitorDetail'

export default function App() {
  const [path, setPath] = useState(
    window.location.pathname.replace(/\/$/, '') || '/',
  )
  const [session, setSession] = useState(getSession)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const authMode = authRoutes[path]
  const isHome = path === '/'
  const monitorId = path.match(/^\/monitors\/([^/]+)$/)?.[1]
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
    if (session && !isHome)
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
  }, [session, retry, isHome])
  useEffect(() => {
    if (session && ['/login', '/register'].includes(path)) navigate('/overview')
    if (!session && !authMode && !isHome) navigate('/login')
    const label =
      (path === '/monitors/new'
        ? 'Create monitor'
        : monitorId
          ? 'Monitor'
          : navigation.find((item) => item.path === path)?.label) ||
      {
        register: 'Create account',
        forgot: 'Reset password',
        reset: 'New password',
        verify: 'Verify email',
      }[authMode] ||
      'Sign in'
    document.title = isHome
      ? 'HeadsUp · Keep up without keeping tabs.'
      : `${label} · HeadsUp`
  }, [session, path, authMode, isHome, monitorId])
  if (isHome) return <Home signedIn={Boolean(session)} />
  if (authMode && !(session && ['/login', '/register'].includes(path)))
    return (
      <>
        <ServiceStatusBanner />
        <Auth key={`${path}${window.location.search}`} mode={authMode} />
      </>
    )
  if (!session) return null
  function signOut() {
    saveSession(null)
    setError('')
    navigate('/login')
  }
  const page = navigation.find(
    (item) =>
      item.path === path ||
      (item.path === '/monitors' && path.startsWith('/monitors/')),
  )
  return (
    <>
      <ServiceStatusBanner />
      <AppLayout
        path={path}
        user={user}
        title={
          path === '/monitors/new' ? 'Create monitor' : page?.label || 'Page'
        }
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
            <LoadingState
              className="loading-panel"
              label="Loading your account"
            >
              <p className="text-secondary mt-3">Getting your space ready…</p>
            </LoadingState>
          )
        ) : path === '/overview' ? (
          <Overview user={user} />
        ) : path === '/monitors' ? (
          <Monitors />
        ) : path === '/monitors/new' ? (
          <CreateMonitor />
        ) : monitorId ? (
          <MonitorDetail key={monitorId} monitorId={monitorId} />
        ) : ['/profile', '/security'].includes(path) ? (
          <Settings
            key={path}
            user={user}
            setUser={setUser}
            security={path === '/security'}
          />
        ) : path === '/api-keys' ? (
          <ApiKeys />
        ) : ['/admin/users', '/admin/signup'].includes(path) ? (
          user.role === 'admin' ? (
            path === '/admin/signup' ? (
              <AdminSignupSettings />
            ) : (
              <AdminUsers currentUser={user} setCurrentUser={setUser} />
            )
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
              Only administrators can access this page.
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
    </>
  )
}
