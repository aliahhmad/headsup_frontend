import { useEffect, useState } from 'react'
import { Icon, Link } from '../UI'
import { notificationCounts } from '../../lib/notifications'
import './Notifications.css'

export default function NotificationBell() {
  const [state, setState] = useState(null)
  useEffect(() => {
    let active = true
    let version = 0
    async function refresh() {
      const request = ++version
      try {
        const counts = await notificationCounts()
        if (active && request === version) setState({ counts })
      } catch {
        if (active && request === version) setState((previous) => ({ ...previous, error: true }))
      }
    }
    function visibleRefresh() { if (!document.hidden) refresh() }
    refresh()
    const timer = window.setInterval(visibleRefresh, 10000)
    window.addEventListener('headsup:notifications', refresh)
    window.addEventListener('focus', visibleRefresh)
    document.addEventListener('visibilitychange', visibleRefresh)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener('headsup:notifications', refresh)
      window.removeEventListener('focus', visibleRefresh)
      document.removeEventListener('visibilitychange', visibleRefresh)
    }
  }, [])
  const unread = state?.counts?.unread
  const label = state?.error ? 'Notifications — unable to refresh count' : unread == null ? 'Notifications' : `Notifications, ${unread} unread`
  return <Link to="/notifications" className="notification-bell" aria-label={label} title={label}>
    <Icon name="bell" />
    {unread > 0 && <span className="notification-bell-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
    {state?.error && <span className="notification-bell-error" aria-hidden="true">!</span>}
  </Link>
}
