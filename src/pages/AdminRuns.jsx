import { useEffect, useState } from 'react'
import { Icon, Link, Notice, PageHeading } from '../components/UI'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import { RunBadge, RunMetric } from '../components/admin/RunWidgets'
import { duration, getRunSummary, humanize, listAdminRuns, localDateTime, runParams, runStages, shortId, utcDateTime } from '../lib/runDashboard'
import { formatMonitorDate } from '../lib/monitors'
import './AdminRuns.css'

const blank = { q: '', status: '', trigger: '', alert_status: '', user_id: '', monitor_id: '', created_from: '', created_to: '', order: 'newest' }

function initialFilters() {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(Object.entries(blank).map(([key, value]) => [key, params.get(key) || value]))
}

export default function AdminRuns() {
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState(filters.q)
  const [page, setPage] = useState(1)
  const [live, setLive] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [result, setResult] = useState(null)
  const filterKey = JSON.stringify(filters)
  const requestKey = `${filterKey}:${page}`
  const current = result?.key === requestKey ? result : null
  const data = current?.data

  useEffect(() => {
    let active = true
    let timer
    const selected = JSON.parse(filterKey)
    const url = runParams(selected)
    window.history.replaceState({}, '', `${window.location.pathname}${url.size ? `?${url}` : ''}`)
    async function load() {
      try {
        const [data, summary] = await Promise.all([listAdminRuns(selected, page), getRunSummary(selected)])
        if (!active) return
        if (page > Math.max(1, data.pages)) { setPage(Math.max(1, data.pages)); return }
        setResult({ key: requestKey, data, summary, updated: new Date(), error: '' })
      } catch (error) {
        if (active) setResult((previous) => ({ ...(previous?.key === requestKey ? previous : {}), key: requestKey, error: error.message }))
      }
      if (active && live) timer = window.setTimeout(load, 5000)
    }
    load()
    return () => { active = false; window.clearTimeout(timer) }
  }, [filterKey, page, requestKey, live, refresh])

  function filter(name, value) { setFilters((previous) => ({ ...previous, [name]: value })); setPage(1) }
  const scoped = Object.keys(blank).some((key) => filters[key] !== blank[key])
  const summary = current?.summary
  return <div className="run-dashboard">
    <PageHeading eyebrow="ADMINISTRATION / EXECUTIONS" title="Monitor runs"
      action={<div className="run-refresh-controls">
        <label><input type="checkbox" checked={live} onChange={(event) => setLive(event.target.checked)} /> Live refresh</label>
        <button className="btn btn-outline-primary" type="button" onClick={() => setRefresh((value) => value + 1)}><Icon name="arrow-clockwise" /> Refresh</button>
      </div>}>
      Follow research and alert processing across accounts. Inspect an execution from its inputs to its evidence.
    </PageHeading>
    <div className="run-metrics">
      <RunMetric label="Runs in scope" value={summary?.total ?? '—'} note={scoped ? 'Matching your filters' : 'Across all accounts'} />
      <RunMetric label="Research in progress" value={summary ? summary.running + summary.queued : '—'} note={summary ? `${summary.running} running · ${summary.queued} queued` : 'Loading execution states'} tone="teal" />
      <RunMetric label="Failures" value={summary ? summary.failed + summary.alerts_failed : '—'} note={summary ? `${summary.failed} research · ${summary.alerts_failed} composition` : 'Research and composition'} tone="amber" />
      <RunMetric label="Published digests" value={summary?.alerts_published ?? '—'} note={summary ? `${summary.alerts_pending + summary.alerts_processing} awaiting composition` : 'Alert job outcomes'} tone="teal" />
      <RunMetric label="Average execution" value={duration(summary?.average_duration_seconds)} note="Started-to-completed runs in scope" />
    </div>
    <section className="card run-directory" aria-labelledby="run-directory-title">
      <div className="run-directory-heading"><div><h2 id="run-directory-title">Execution history</h2><p>Search by account, monitor, objective, run ID, or monitor ID.</p></div>
        {current?.updated && <small>Updated {current.updated.toLocaleTimeString()}</small>}
      </div>
      <form className="run-search" onSubmit={(event) => { event.preventDefault(); filter('q', search.trim()) }}>
        <label className="visually-hidden" htmlFor="run-search">Search executions</label>
        <div className="run-search-input"><Icon name="search" /><input id="run-search" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Account email, monitor, objective or ID" /></div>
        <button className="btn btn-primary" type="submit">Search</button>
        {scoped && <button className="btn btn-light" type="button" onClick={() => { setFilters(blank); setSearch(''); setPage(1) }}>Clear filters</button>}
      </form>
      <div className="run-filters">
        <label>Research status<select className="form-select" value={filters.status} onChange={(event) => filter('status', event.target.value)}>
          <option value="">All statuses</option>{['queued', 'running', 'succeeded', 'failed', 'cancelled'].map((value) => <option value={value} key={value}>{humanize(value)}</option>)}
        </select></label>
        <label>Trigger<select className="form-select" value={filters.trigger} onChange={(event) => filter('trigger', event.target.value)}>
          <option value="">All triggers</option>{['initial', 'manual', 'scheduled'].map((value) => <option value={value} key={value}>{humanize(value)}</option>)}
        </select></label>
        <label>Alert processing<select className="form-select" value={filters.alert_status} onChange={(event) => filter('alert_status', event.target.value)}>
          <option value="">All outcomes</option>{['pending', 'processing', 'published', 'skipped', 'failed', 'cancelled', 'not_evaluated'].map((value) => <option value={value} key={value}>{humanize(value)}</option>)}
        </select></label>
        <label>Order<select className="form-select" value={filters.order} onChange={(event) => filter('order', event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      </div>
      <details className="run-advanced"><summary>Account, monitor and date filters</summary><div className="run-filters">
        <label>Account ID<input className="form-control" type="number" min="1" value={filters.user_id} onChange={(event) => filter('user_id', event.target.value)} /></label>
        <label>Monitor UUID<input className="form-control" value={filters.monitor_id} onChange={(event) => filter('monitor_id', event.target.value)} placeholder="Exact monitor ID" /></label>
        <label>Created from<input className="form-control" type="datetime-local" value={localDateTime(filters.created_from)} onChange={(event) => filter('created_from', utcDateTime(event.target.value))} /></label>
        <label>Created to<input className="form-control" type="datetime-local" value={localDateTime(filters.created_to)} onChange={(event) => filter('created_to', utcDateTime(event.target.value))} /></label>
      </div><p>Dates are entered in your local timezone. Historical soft-deleted monitors remain visible here.</p></details>
      <Notice>{current?.error}</Notice>
      {!current && <LoadingState label="Loading executions" />}
      {current?.error && !data && <div className="run-empty"><p>The execution directory could not be loaded.</p><button className="btn btn-outline-primary" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>}
      {data?.items.length === 0 && <EmptyState icon="activity" title={scoped ? 'No executions match these filters.' : 'No monitor runs yet.'}>Queued and completed checks will appear here.</EmptyState>}
      {Boolean(data?.items.length) && <>
        <div className="run-table-scroll" role="region" aria-label="Scrollable run directory" tabIndex={0}>
          <table className="run-table"><thead><tr><th>Run</th><th>Monitor</th><th>Account</th><th>Research</th><th>Alert processing</th><th>Latest recorded request</th><th>Outputs</th><th>Timing</th><th><span className="visually-hidden">Inspect</span></th></tr></thead><tbody>
            {data.items.map((run) => <tr key={run.id}>
              <td><Link to={`/admin/runs/${run.id}`} className="run-table-id" title={run.id}>{shortId(run.id)} <Icon name="arrow-up-right" /></Link><small>{humanize(run.trigger)} · attempt {run.attempt_count}</small><time dateTime={run.created_at}>{formatMonitorDate(run.created_at)}</time></td>
              <td><strong>{run.monitor_name}</strong><small title={run.monitor_id}>{shortId(run.monitor_id)} · {run.monitor_deleted_at ? 'Deleted' : humanize(run.monitor_status)}</small></td>
              <td><strong>{run.owner.first_name} {run.owner.last_name}</strong><span>{run.owner.email}</span><small>Account #{run.owner.id}{run.owner.banned ? ' · Banned' : ''}</small></td>
              <td><RunBadge status={run.status} />{run.error_code && <code className="run-error-code">{run.error_code}</code>}</td>
              <td><RunBadge status={run.alert_status} />{run.alert_error_code && <code className="run-error-code">{run.alert_error_code}</code>}</td>
              <td>{run.latest_stage ? <><strong>{runStages[run.latest_stage]}</strong><small>{humanize(run.latest_request_status)} · {run.trace_count} recorded</small></> : <small>{run.status === 'queued' ? 'Not started' : 'No request traces recorded'}</small>}</td>
              <td><span>{run.observation_count} observations</span><small>{run.source_count} sources · {run.alert_count} alerts</small></td>
              <td><strong>{duration(run.elapsed_seconds)}</strong><small>Queue: {duration(run.queue_seconds)}</small></td>
              <td><Link className="btn btn-outline-primary btn-sm" to={`/admin/runs/${run.id}`}>Inspect</Link></td>
            </tr>)}
          </tbody></table>
        </div>
        <Pagination page={page} pages={data.pages} total={data.total} pageSize={20} itemLabel="runs" filtered={scoped} label="Execution history pagination" onPageChange={setPage} />
      </>}
    </section>
    <p className="run-footnote"><Icon name="shield-lock" /> Administrator access only. Refreshing observes existing work; it does not enqueue checks or make model requests.</p>
  </div>
}
