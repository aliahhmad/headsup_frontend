import { useEffect, useRef, useState } from 'react'
import { Icon, Notice } from '../UI'
import {
  formatMonitorDate, getMonitorAlert, markMonitorAlertRead,
} from '../../lib/monitors'

export default function MonitorAlertDetail({ monitorId, alert, onRead, onClose }) {
  const dialog = useRef(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [readError, setReadError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    let active = true
    getMonitorAlert(monitorId, alert.id)
      .then((data) => {
        if (!active) return
        setDetail(data)
        setError('')
      })
      .catch((err) => {
        if (active) setError(`Couldn’t load the sources. ${err.message}`)
      })

    if (!alert.read_at) {
      markMonitorAlertRead(monitorId, alert.id)
        .then((updated) => {
          if (!active) return
          onRead(updated)
          setReadError('')
        })
        .catch((err) => {
          if (active) setReadError(`Couldn’t mark this update as read. ${err.message}`)
        })
    }
    return () => { active = false }
  }, [monitorId, alert.id, alert.read_at, onRead, retry])

  return (
    <dialog ref={dialog} className="monitor-alert-dialog" aria-labelledby="monitor-alert-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}>
      <header className="monitor-alert-dialog-heading">
        <div>
          <p className="eyebrow">UPDATE</p>
          <h2 id="monitor-alert-dialog-title">{alert.title}</h2>
          <time dateTime={alert.created_at}>{formatMonitorDate(alert.created_at)}</time>
        </div>
        <button type="button" className="btn icon-button" aria-label="Close update" onClick={onClose}>
          <Icon name="x-lg" />
        </button>
      </header>
      <div className="monitor-alert-dialog-body">
        <p className="monitor-alert-message">{alert.body}</p>
        <section className="monitor-alert-evidence" aria-labelledby="monitor-alert-evidence-heading">
          <h3 id="monitor-alert-evidence-heading">Supporting evidence</h3>
          <Notice>{error || readError}</Notice>
          {(error || readError) && (
            <button type="button" className="btn btn-outline-primary btn-sm mb-3"
              onClick={() => setRetry((value) => value + 1)}>Try again</button>
          )}
          {!detail && !error && <p role="status">Loading sources…</p>}
          {detail?.observations.map((observation) => (
            <div className="monitor-alert-source-group" key={observation.id}>
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
        </section>
      </div>
      <footer className="monitor-alert-dialog-footer">
        <button type="button" className="btn btn-outline-primary" onClick={onClose}>Back to updates</button>
      </footer>
    </dialog>
  )
}
