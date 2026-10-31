import { useEffect, useState } from 'react'
import { Icon, Notice } from '../UI'
import {
  formatMonitorDate, getMonitorAlert, listMonitorAlerts, updateMonitorAlert,
} from '../../lib/monitors'

export default function MonitorAlerts({ monitorId }) {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [details, setDetails] = useState({})
  const [openId, setOpenId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)

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

  async function showSources(alert) {
    if (openId === alert.id) {
      setOpenId(null)
      return
    }
    setBusy(alert.id)
    try {
      const detail = await getMonitorAlert(monitorId, alert.id)
      setDetails((previous) => ({ ...previous, [alert.id]: detail }))
      setOpenId(alert.id)
      if (!alert.read_at) {
        const updated = await updateMonitorAlert(monitorId, alert.id, { read: true })
        setResult((previous) => previous && ({
          ...previous, items: previous.items.map((item) => item.id === alert.id ? updated : item),
        }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  async function dismiss(alertId) {
    setBusy(alertId)
    try {
      await updateMonitorAlert(monitorId, alertId, { dismissed: true })
      const data = await listMonitorAlerts(monitorId, page)
      setResult({ ...data, page })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const current = result?.page === page ? result : null
  return (
    <section className="card monitor-alerts" aria-labelledby="monitor-alerts-heading">
      <header className="monitor-panel-heading">
        <div className="monitor-panel-title">
          <span className="tile-icon tone-teal"><Icon name="bell" /></span>
          <div>
            <h2 id="monitor-alerts-heading">Updates</h2>
            <p>Meaningful changes, with their sources.</p>
          </div>
        </div>
      </header>
      <div className="monitor-alerts-body">
        <Notice>{error}</Notice>
        {!current && !error && <p role="status">Loading updates…</p>}
        {current?.items.length === 0 && <p>No alerts yet. Updates will appear when a check finds something worth your attention.</p>}
        {current?.items.map((alert) => (
          <article className="monitor-alert-item" key={alert.id}>
            <div className="monitor-alert-title">
              <h3>{alert.title}</h3>
              {!alert.read_at && <span className="badge text-bg-primary">Unread</span>}
            </div>
            <time dateTime={alert.created_at}>{formatMonitorDate(alert.created_at)}</time>
            <p className="monitor-alert-message">{alert.body}</p>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-outline-primary btn-sm" disabled={busy === alert.id}
                aria-expanded={openId === alert.id} onClick={() => showSources(alert)}>
                {openId === alert.id ? 'Hide evidence' : 'View evidence'}
              </button>
              <button className="btn btn-outline-secondary btn-sm" disabled={busy === alert.id}
                onClick={() => dismiss(alert.id)}>Dismiss</button>
            </div>
            {openId === alert.id && details[alert.id] && (
              <div className="monitor-alert-evidence">
                {details[alert.id].observations.map((observation) => (
                  <div key={observation.id}>
                    <p>{observation.summary}</p>
                    <ul>{observation.sources.map((source) => (
                      <li key={source.id}>
                        <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                          {source.source_title || source.source_url}
                        </a>
                      </li>
                    ))}</ul>
                  </div>
                ))}
              </div>
            )}
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
    </section>
  )
}
