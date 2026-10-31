import { useEffect, useRef, useState } from 'react'
import { Icon, Notice, PageHeading } from '../components/UI'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Pagination from '../components/ui/Pagination'
import { formatMonitorDate } from '../lib/monitors'
import { listNotifications, markNotificationsSeen, notificationCounts, notificationTypes, updateNotification } from '../lib/notifications'
import { navigate } from '../lib/navigation'
import '../components/notifications/Notifications.css'

export default function Notifications() {
  const [filters, setFilters] = useState({ type: '', unread: false, page: 1 })
  const [refresh, setRefresh] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [seenError, setSeenError] = useState('')
  const [busy, setBusy] = useState('')
  const alive = useRef(false)
  const action = useRef(false)
  const revision = useRef(0)
  const key = JSON.stringify(filters)
  const current = result?.key === key ? result : null

  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => {
    let active = true
    let timer
    async function load() {
      const version = revision.current
      try {
        const selected = JSON.parse(key)
        const [data, counts] = await Promise.all([listNotifications(selected), notificationCounts()])
        if (!active || version !== revision.current) return
        if (selected.page > Math.max(1, data.pages)) {
          setFilters((previous) => ({ ...previous, page: Math.max(1, data.pages) })); return
        }
        setResult({ key, data, counts, updated: new Date() })
      } catch (error) {
        if (active && version === revision.current) setResult((previous) => ({ ...(previous?.key === key ? previous : {}), key, error: error.message }))
      }
      if (active) timer = window.setTimeout(load, 10000)
    }
    load()
    return () => { active = false; window.clearTimeout(timer) }
  }, [key, refresh])

  // This effect runs after the rows have been committed to the DOM. Fetching
  // the inbox or refreshing the bell alone never acknowledges unseen items.
  const unseenKey = JSON.stringify(current?.data?.items.filter((item) => !item.seen_at).map((item) => item.id) || [])
  const renderedAt = current?.updated
  useEffect(() => {
    const ids = JSON.parse(unseenKey)
    if (!ids.length) return
    let active = true
    let inFlight = false
    let acknowledged = false
    async function acknowledge() {
      if (document.hidden || inFlight || acknowledged) return
      inFlight = true
      try {
        await markNotificationsSeen(ids)
        acknowledged = true
        if (active) setSeenError('')
      } catch (error) {
        if (active) setSeenError(`Couldn’t mark notifications as seen. ${error.message}`)
      } finally { inFlight = false }
    }
    acknowledge()
    document.addEventListener('visibilitychange', acknowledge)
    return () => { active = false; document.removeEventListener('visibilitychange', acknowledge) }
  }, [unseenKey, renderedAt])

  function filter(name, value) { setFilters((previous) => ({ ...previous, [name]: value, page: 1 })) }

  async function act(item, open = false) {
    if (action.current) return
    action.current = true
    revision.current += 1
    setBusy(item.id)
    setError('')
    try {
      if (!open || !item.read_at) await updateNotification(item.id, { read: open ? true : !item.read_at })
      if (alive.current && open) navigate(item.target)
    } catch (error) {
      if (alive.current) setError(error.message)
    } finally {
      action.current = false
      revision.current += 1
      if (alive.current) { setBusy(''); setRefresh((value) => value + 1) }
    }
  }

  return <div className="notifications-page">
    <PageHeading eyebrow="YOUR INBOX" title="Notifications"
      action={<button type="button" className="btn btn-outline-primary" onClick={() => setRefresh((value) => value + 1)}><Icon name="arrow-clockwise" /> Refresh</button>}>
      Alerts and changes to your monitors, together in one quiet place. Read items stay in your history.
    </PageHeading>
    <section className="card notification-inbox" aria-labelledby="notification-inbox-title">
      <header className="notification-inbox-heading"><div><h2 id="notification-inbox-title">Your activity</h2><p>{current?.counts ? `${current.counts.unread} unread · ${current.counts.total} notifications` : 'Gathering your latest activity…'}</p></div>
        {current?.updated && <small>Updated {current.updated.toLocaleTimeString()}</small>}
      </header>
      <div className="notification-filters">
        <label>Notification type<select className="form-select" value={filters.type} onChange={(event) => filter('type', event.target.value)}><option value="">All activity</option>{notificationTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
        <label className="notification-unread-filter"><input type="checkbox" checked={filters.unread} onChange={(event) => filter('unread', event.target.checked)} /> Unread only</label>
      </div>
      <Notice>{error || current?.error || seenError}</Notice>
      {!current && <LoadingState label="Loading notifications" />}
      {current?.data?.items.length === 0 && <EmptyState icon="bell" title={filters.type || filters.unread ? 'No notifications match these filters.' : 'You’re all caught up.'}>Published alerts and monitor activations or pauses will appear here.</EmptyState>}
      <div className="notification-items">
        {current?.data?.items.map((item) => {
          const type = notificationTypes.find((entry) => entry.value === item.type)
          return <article className={`notification-item ${item.read_at ? '' : 'is-unread'}`} key={item.id}>
            <span className={`tile-icon tone-${type?.tone || 'blue'}`}><Icon name={type?.icon || 'bell'} /></span>
            <div className="notification-content"><div className="notification-title"><h3><button type="button" disabled={Boolean(busy)} onClick={() => act(item, true)}>{item.title}</button></h3>{!item.read_at && <span className="badge text-bg-primary">Unread</span>}</div>
              <p>{item.message}</p><div className="notification-meta"><span>{type?.label || 'Notification'}</span><time dateTime={item.created_at}>{formatMonitorDate(item.created_at)}</time></div>
              <div className="notification-actions"><button className="btn btn-outline-primary btn-sm" disabled={Boolean(busy)} type="button" onClick={() => act(item, true)}>{busy === item.id ? 'Updating…' : item.type === 'alert.published' ? 'Open update' : 'Open monitor'} <Icon name="arrow-up-right" /></button>
                <button className="btn btn-link btn-sm" type="button" disabled={Boolean(busy)} onClick={() => act(item)}>{item.read_at ? 'Mark unread' : 'Mark read'}</button></div>
            </div>
          </article>
        })}
      </div>
      {current?.data && <Pagination page={filters.page} pages={current.data.pages} total={current.data.total} pageSize={20} itemLabel="notifications" label="Notification history pagination" filtered={Boolean(filters.type || filters.unread)} onPageChange={(page) => setFilters((previous) => ({ ...previous, page }))} />}
    </section>
  </div>
}
