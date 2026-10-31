import { useCallback, useEffect, useState } from 'react'
import { Icon, Notice } from '../UI'
import MonitorAlertDetail from './MonitorAlertDetail'
import {
  formatMonitorDate, getMonitorAlert, listMonitorAlerts,
} from '../../lib/monitors'

export default function MonitorAlerts({ monitorId }) {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [linkError, setLinkError] = useState('')
  const [requestedAlert, setRequestedAlert] = useState(() => new URLSearchParams(window.location.search).get('alert'))

  useEffect(() => {
    function onNavigate() { setRequestedAlert(new URLSearchParams(window.location.search).get('alert')) }
    window.addEventListener('popstate', onNavigate)
    return () => window.removeEventListener('popstate', onNavigate)
  }, [])

  useEffect(() => {
    if (!requestedAlert) return
    let active = true
    getMonitorAlert(monitorId, requestedAlert)
      .then((alert) => { if (active) { setSelected(alert); setLinkError('') } })
      .catch((error) => { if (active) setLinkError(`Couldn’t open this update. ${error.message}`) })
    return () => { active = false }
  }, [monitorId, requestedAlert])

  function closeUpdate() {
    setSelected(null)
    setRequestedAlert(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('alert')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }

  useEffect(() => {
    let active = true
    let timer
    async function refresh() {
      try {
        const data = await listMonitorAlerts(monitorId, page)
        if (!active) return
        setResult({ ...data, page })
        setError('')
      } catch (err) {
        if (active) setError(err.message)
      }
      if (active) timer = window.setTimeout(refresh, 5000)
    }
    refresh()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [monitorId, page])

  const handleRead = useCallback((updated) => {
    setResult((previous) => previous && ({
      ...previous,
      items: previous.items.map((item) => item.id === updated.id ? updated : item),
    }))
  }, [])

  const current = result?.page === page ? result : null
  return (
    <section className="card monitor-alerts" aria-labelledby="monitor-alerts-heading">
      <header className="monitor-panel-heading">
        <div className="monitor-panel-title">
          <span className="tile-icon tone-teal"><Icon name="bell" /></span>
          <div>
            <h2 id="monitor-alerts-heading">Updates</h2>
            <p>Your update history. Open any update to read more.</p>
          </div>
        </div>
        {current && <span className="monitor-alert-count">{current.total} {current.total === 1 ? 'update' : 'updates'}</span>}
      </header>
      <div className="monitor-alerts-body">
        <Notice>{linkError || error}</Notice>
        {!current && !error && <p role="status">Loading updates…</p>}
        {current?.items.length === 0 && <p>No alerts yet. Updates will appear when a check finds something worth your attention.</p>}
        {current?.items.map((alert) => (
          <article className="monitor-alert-item" key={alert.id}>
            <div className="monitor-alert-title">
              <h3>
                <button type="button" className="monitor-alert-open" aria-haspopup="dialog"
                  onClick={() => setSelected(alert)}>
                  {alert.title} <Icon name="arrows-angle-expand" />
                </button>
              </h3>
              {!alert.read_at && <span className="badge text-bg-primary">Unread</span>}
            </div>
            <time dateTime={alert.created_at}>{formatMonitorDate(alert.created_at)}</time>
            <p className="monitor-alert-message monitor-alert-preview">{alert.body}</p>
            <button type="button" className="btn btn-outline-primary btn-sm" aria-haspopup="dialog"
              onClick={() => setSelected(alert)}>Open update <Icon name="arrows-angle-expand" /></button>
          </article>
        ))}
        {current && (current.pages > 1 || page > 1) && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-outline-primary btn-sm" disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}>Previous</button>
            <span>Page {page}</span>
            <button className="btn btn-outline-primary btn-sm" disabled={page >= current.pages}
              onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        )}
      </div>
      {selected && (
        <MonitorAlertDetail key={selected.id} monitorId={monitorId} alert={selected}
          onRead={handleRead} onClose={closeUpdate} />
      )}
    </section>
  )
}
