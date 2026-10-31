import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Icon, Link, Notice, PageHeading } from '../components/UI'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import { RunBadge, RunMetric, RunPanel } from '../components/admin/RunWidgets'
import { humanize, listAdminRuns, shortId } from '../lib/runDashboard'
import { formatMonitorDate } from '../lib/monitors'
import './AdminRuns.css'
import './AdminQueue.css'

export default function AdminQueue() {
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [refresh, setRefresh] = useState(0)
  const alive = useRef(false)
  const action = useRef(false)
  const revision = useRef(0)
  const state = result?.state
  const pending = state?.outstanding
  const automatic = state?.automatic_enabled

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  useEffect(() => {
    let active = true
    let timer
    async function load() {
      const version = revision.current
      try {
        const [state, runs] = await Promise.all([
          api('/admin/queue'), listAdminRuns({ status: 'queued', order: 'oldest' }, 1),
        ])
        if (active && version === revision.current) {
          setResult({ state, runs, updated: new Date(), error: '' })
        }
      } catch (error) {
        if (active && version === revision.current) {
          setResult((previous) => ({ ...previous, error: error.message }))
        }
      }
      if (active) timer = window.setTimeout(load, 3000)
    }
    load()
    return () => { active = false; window.clearTimeout(timer) }
  }, [refresh])

  async function perform(kind) {
    if (action.current) return
    action.current = true
    revision.current += 1
    setBusy(kind)
    setError('')
    setMessage('')
    try {
      if (kind === 'single') {
        const execution = await api('/admin/queue/run-next', { method: 'POST' })
        if (alive.current) {
          setResult((previous) => ({ ...previous, state: { ...previous.state, outstanding: execution } }))
          setMessage('One item requested. The worker will pick it up shortly; follow its status below.')
        }
      } else {
        const updated = await api('/admin/queue/settings', { method: 'PATCH', body: { automatic_enabled: !automatic } })
        if (alive.current) {
          setResult((previous) => ({ ...previous, state: updated }))
          setMessage(updated.automatic_enabled
            ? 'Automatic processing is on. The worker will process available items one at a time.'
            : 'Automatic processing is off. Any item already admitted will finish before the queue pauses.')
        }
      }
    } catch (error) {
      if (alive.current) setError(error.message)
    } finally {
      action.current = false
      revision.current += 1
      if (alive.current) { setBusy(''); setRefresh((value) => value + 1) }
    }
  }

  return <div className="run-dashboard queue-dashboard">
    <PageHeading eyebrow="ADMINISTRATION / PROCESSING" title="Queue"
      action={<button className="btn btn-outline-primary" type="button" onClick={() => setRefresh((value) => value + 1)}><Icon name="arrow-clockwise" /> Refresh</button>}>
      Control processing across all accounts. Let the queue run automatically, or step through one item at a time.
    </PageHeading>
    <Notice>{error || result?.error}</Notice>
    <Notice type="success">{message}</Notice>
    {!result && <LoadingState label="Loading queue controls" />}
    {state && <>
      <div className="run-metrics queue-metrics">
        <RunMetric label="Queued research" value={state.queued_research} note="Existing checks awaiting a worker" />
        <RunMetric label="Active research" value={state.running_research} note="All saved running checks" tone="teal" />
        <RunMetric label="Alert work due" value={state.due_alerts} note={`${state.waiting_alerts} waiting for retry · ${state.processing_alerts} processing`} tone="amber" />
        <RunMetric label="Worker heartbeat" value={state.worker_online ? 'Online' : 'Not detected'} note={state.heartbeat_at ? `Last seen ${formatMonitorDate(state.heartbeat_at)}` : 'Waiting for a worker heartbeat'} tone={state.worker_online ? 'teal' : 'amber'} />
      </div>
      <div className="queue-controls">
        <RunPanel title="Automatic processing" aside={<RunBadge status={automatic ? 'running' : 'paused'} />}>
          <p>When enabled, the worker checks for available work every five seconds and processes one item at a time.</p>
          <p className="text-secondary">Turning it off lets the current item finish. It does not delete queued checks or change monitor schedules.</p>
          <button className={`btn ${automatic ? 'btn-outline-primary' : 'btn-primary'}`} type="button"
            disabled={Boolean(busy) || (!automatic && (!state.provider_configured || pending?.mode === 'manual'))}
            onClick={() => perform('automatic')}>
            <Icon name={automatic ? 'pause-circle' : 'play-circle'} /> {busy === 'automatic' ? 'Saving…' : automatic ? 'Turn automatic off' : 'Turn automatic on'}
          </button>
          <small className="queue-setting-note">{state.updated_by_user_id ? `Last saved by account #${state.updated_by_user_id} · ${formatMonitorDate(state.updated_at)}` : 'Automatic processing starts off by default.'}</small>
        </RunPanel>
        <RunPanel title="Run one item" aside={<Icon name="skip-end-circle" />}>
          <p>Process the next executable item, then stop. A due alert composition takes priority; otherwise the worker runs a queued research check and its immediate alert composition.</p>
          <p className="text-secondary">Turn automatic processing off and wait for any active item to finish before stepping through the queue.</p>
          <button className="btn btn-primary" type="button" disabled={Boolean(busy || automatic || pending) || !state.provider_configured || !state.worker_online}
            onClick={() => perform('single')}>
            <Icon name="play-fill" /> {busy === 'single' ? 'Requesting…' : pending?.mode === 'manual' ? 'Single step in progress' : 'Run next item'}
          </button>
          <small className="queue-setting-note">This action can make live model requests. No work is started by opening or refreshing this page.</small>
        </RunPanel>
      </div>
      {!state.provider_configured && <Notice>Configure OPENAI_API_KEY on the server to enable processing.</Notice>}
      {!state.worker_online && <Notice>No recent worker heartbeat. Check that the updated API is running and the queue migration is applied.</Notice>}
      {state.worker_error_code && state.provider_configured && <Notice>Worker status: {humanize(state.worker_error_code)}. Refresh to check whether it recovers.</Notice>}
      <RunPanel title="Current request" aside={pending && <RunBadge status={pending.status} />}>
        {pending ? <div className="queue-current" aria-live="polite">
          <div><strong>{humanize(pending.mode)} processing</strong><p>{pending.status === 'pending' ? 'Waiting for the worker to admit this request.' : automatic ? 'Processing one item. Automatic mode will continue afterward.' : 'Finishing this item. No further item will start automatically.'}</p>
            <small>Requested {formatMonitorDate(pending.created_at)}{pending.requested_by_user_id ? ` · Account #${pending.requested_by_user_id}` : ''}</small></div>
          {pending.monitor_run_id && <Link className="btn btn-outline-primary" to={`/admin/runs/${pending.monitor_run_id}`}>Inspect live run <Icon name="arrow-up-right" /></Link>}
        </div> : <p className="mb-0">{automatic ? 'Waiting for executable work. The worker will check again shortly.' : 'The queue is paused. Choose Run next item when you are ready.'}</p>}
      </RunPanel>
      <RunPanel title="Queued research" aside={<Link to="/admin/runs?status=queued&order=oldest">View all queued runs <Icon name="arrow-up-right" /></Link>}>
        <p className="text-secondary">Oldest queued checks first. Eligibility is checked when claimed; busy monitors or pending alert work can change which item runs next.</p>
        {result.runs?.items.length ? <div className="run-table-scroll" role="region" aria-label="Queued research" tabIndex={0}><table className="run-table"><thead><tr><th>Run</th><th>Monitor</th><th>Account</th><th>Created</th><th><span className="visually-hidden">Inspect</span></th></tr></thead><tbody>
          {result.runs.items.map((run) => <tr key={run.id}><td><code>{shortId(run.id)}</code><small>{humanize(run.trigger)}</small></td><td><strong>{run.monitor_name}</strong><small>{humanize(run.monitor_status)}</small></td><td>{run.owner.email}<small>Account #{run.owner.id}</small></td><td>{formatMonitorDate(run.created_at)}</td><td><Link className="btn btn-outline-primary btn-sm" to={`/admin/runs/${run.id}`}>Inspect</Link></td></tr>)}
        </tbody></table></div> : <EmptyState icon="check2-circle" title="No queued research checks.">Due alert work may still be available. <Link to="/admin/runs?alert_status=pending">Inspect pending alert jobs.</Link></EmptyState>}
      </RunPanel>
      <RunPanel title="Recent processing attempts" aside={<small>{result.updated && `Updated ${result.updated.toLocaleTimeString()}`}</small>}>
        <p className="text-secondary">Latest 20 requests. Completed means the worker finished its attempt; research and alert outcomes are shown separately. Empty automatic polls are omitted.</p>
        {state.recent.length ? <div className="run-table-scroll" role="region" aria-label="Recent queue processing" tabIndex={0}><table className="run-table"><thead><tr><th>Requested</th><th>Mode / account</th><th>Request</th><th>Research / alerts</th><th>Run</th></tr></thead><tbody>
          {state.recent.map((item) => <tr key={item.id}><td>{formatMonitorDate(item.created_at)}<small>{item.completed_at ? `Finished ${formatMonitorDate(item.completed_at)}` : item.started_at ? `Started ${formatMonitorDate(item.started_at)}` : 'Awaiting admission'}</small></td><td>{humanize(item.mode)}<small>{item.requested_by_user_id ? `Account #${item.requested_by_user_id}` : 'Worker / CLI'}</small></td><td><RunBadge status={item.status} />{item.error_code && <code className="run-error-code">{item.error_code}</code>}{item.status === 'empty' && <small>No executable item found.</small>}{item.status === 'interrupted' && <small>Check the run before retrying.</small>}</td><td>{item.run_status ? <><RunBadge status={item.run_status} /><small>Alerts: {humanize(item.alert_status || 'not_evaluated')}</small></> : '—'}</td><td>{item.monitor_run_id ? <Link to={`/admin/runs/${item.monitor_run_id}`}>{shortId(item.monitor_run_id)} <Icon name="arrow-up-right" /></Link> : '—'}</td></tr>)}
        </tbody></table></div> : <EmptyState icon="clock-history" title="No processing attempts yet.">Manual requests and automatic work will appear here.</EmptyState>}
      </RunPanel>
      <p className="run-footnote"><Icon name="shield-lock" /> Administrator controls apply across all accounts. This consumes existing research and alert work; it does not create recurring scheduled checks.</p>
    </>}
  </div>
}
