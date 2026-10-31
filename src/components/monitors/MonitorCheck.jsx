import { useEffect, useRef, useState } from 'react'
import { Icon, Notice } from '../UI'
import StatusBadge from '../ui/StatusBadge'
import { checkMonitor, formatMonitorDate, getMonitorRun } from '../../lib/monitors'

const states = {
  queued: {
    label: 'Queued',
    icon: 'hourglass-split',
    variant: 'monitor-paused',
    message: 'Your check is queued.',
  },
  running: {
    label: 'Running',
    icon: 'search',
    variant: 'monitor-active',
    message: 'Research is in progress.',
  },
  succeeded: {
    label: 'Completed',
    icon: 'check-circle',
    variant: 'monitor-active',
    message: 'Your latest check completed.',
  },
  failed: {
    label: 'Failed',
    icon: 'exclamation-circle',
    variant: 'monitor-failed',
    message: 'Your latest check failed. You can try a new check.',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'x-circle',
    variant: 'monitor-archived',
    message: 'Your latest check was cancelled.',
  },
}

export default function MonitorCheck({ monitorId, status, initialRun }) {
  const [run, setRun] = useState(initialRun)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')
  const requestId = useRef(null)
  const submitting = useRef(false)
  const pending = run?.status === 'queued' || run?.status === 'running'
  const archived = status === 'archived'
  const runId = run?.id
  const state = states[run?.status]
  const alertState = run?.alert_processing?.status

  useEffect(() => {
    if (!runId) return
    let active = true
    let timer
    async function refresh() {
      try {
        const updated = await getMonitorRun(monitorId, runId)
        if (!active) return
        setRun(updated)
        setRefreshError('')
        const researchPending = updated.status === 'queued' || updated.status === 'running'
        const alertPending = ['pending', 'processing'].includes(updated.alert_processing?.status)
        if (!researchPending && !alertPending) return
      } catch (err) {
        if (!active) return
        setRefreshError(`Couldn’t refresh the check status. ${err.message}`)
      }
      if (active) timer = window.setTimeout(refresh, 5000)
    }
    refresh()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [monitorId, runId])

  async function handleCheck() {
    if (submitting.current || pending || archived) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      // Retain the ID on failure so retrying an uncertain request cannot
      // accidentally queue another check after the first one completed.
      requestId.current ||= crypto.randomUUID()
      const queued = await checkMonitor(monitorId, requestId.current)
      setRun(queued)
      setRefreshError('')
      requestId.current = null
    } catch (err) {
      setError(err.message)
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <section
      className="card monitor-check"
      aria-labelledby="monitor-check-heading"
    >
      <header className="monitor-panel-heading">
        <div className="monitor-panel-title">
          <span className="tile-icon tone-teal">
            <Icon name="search" />
          </span>
          <div>
            <h2 id="monitor-check-heading">Manual check</h2>
            <p>Look for new developments.</p>
          </div>
        </div>
        {run?.status === 'succeeded' && (
          <p className="monitor-check-message" role="status">
            {alertState === 'pending' || alertState === 'processing'
              ? 'Research is saved. Your update is being evaluated.'
              : alertState === 'failed'
                ? 'Research is saved, but preparing the update failed.'
                : alertState === 'published'
                  ? 'A new update is available in Updates.'
                  : alertState === 'skipped'
                    ? 'No alert was needed for this check.'
                    : alertState === 'cancelled'
                      ? 'Update preparation was cancelled because this monitor changed.'
                      : null}
          </p>
        )}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleCheck}
          disabled={busy || pending || archived}
          aria-describedby="monitor-check-help"
        >
          {busy ? (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
          ) : (
            <Icon name="arrow-clockwise" />
          )}
          {busy ? 'Queuing…' : 'Check now'}
        </button>
      </header>
      <div className="monitor-check-body">
        <div aria-live="polite" aria-atomic="true">
          {state ? (
            <>
              <StatusBadge variant={state.variant} icon={state.icon}>
                {state.label}
              </StatusBadge>
              <p className="monitor-check-message">{state.message}</p>
              <time
                dateTime={run.completed_at || run.started_at || run.created_at}
              >
                {formatMonitorDate(
                  run.completed_at || run.started_at || run.created_at,
                )}
              </time>
            </>
          ) : (
            <p className="monitor-check-message">No checks yet.</p>
          )}
        </div>
        <p id="monitor-check-help" className="monitor-check-help">
          {archived
            ? 'Archived monitors can’t start new checks.'
            : pending
              ? 'This page will update as your check progresses.'
              : 'Request a fresh check for this topic. Results may take a little time.'}
        </p>
        <Notice>{error || refreshError}</Notice>
      </div>
    </section>
  )
}
