import { useEffect, useState } from 'react'
import { Icon, Link, Notice, PageHeading } from '../components/UI'
import LoadingState from '../components/ui/LoadingState'
import { RunBadge, RunId, RunJson, RunMetric, RunPanel } from '../components/admin/RunWidgets'
import { duration, getAdminRun, humanize, runStages, shortId, tokenUsage } from '../lib/runDashboard'
import { formatMonitorDate } from '../lib/monitors'
import './AdminRuns.css'

const sections = [
  ['timeline', 'Execution & requests'], ['inputs', 'Inputs & context'],
  ['memories', 'Memories'], ['observations', 'Observations & sources'],
  ['decisions', 'Alert decisions'], ['alerts', 'Published alerts'],
]

function parseInput(value) {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { return value }
}

function Evidence({ observation }) {
  return <article className="run-evidence" id={`observation-${observation.id}`}>
    <header><h3>{observation.summary}</h3><RunId value={observation.id} /></header>
    <p className="run-muted">Saved {formatMonitorDate(observation.created_at)}</p>
    <details className="run-json"><summary>Observation identity</summary><pre>{observation.item_key}</pre></details>
    {observation.sources.map((source) => <div className="run-source" key={source.id}>
      <a href={source.source_url} target="_blank" rel="noopener noreferrer">{source.source_title || source.source_url} <Icon name="box-arrow-up-right" /></a>
      {source.source_title && <small className="run-url">{source.source_url}</small>}
      <dl className="run-facts"><div><dt>Retrieved</dt><dd>{formatMonitorDate(source.retrieved_at)}</dd></div><div><dt>Published</dt><dd>{source.source_published_at ? formatMonitorDate(source.source_published_at) : 'Not captured'}</dd></div></dl>
      {source.evidence_excerpt && <blockquote>{source.evidence_excerpt}</blockquote>}
      <RunJson title="All source fields" value={source} />
    </div>)}
    {!observation.sources.length && <p className="run-warning">No supporting sources are stored for this observation.</p>}
  </article>
}

function MemoryRecord({ memory, current }) {
  const id = memory.memory_id || memory.id
  return <article className="run-memory">
    <header><h3>{humanize(memory.kind)}</h3><span className="run-version">Version {memory.version ?? 'unknown'}</span></header>
    {id && <RunId value={id} />}
    {current && <p className="run-muted">Current monitor memory is version {current.version}{current.version === memory.version ? ' (same version)' : ' (different from this snapshot)'}.</p>}
    {memory.change_reason && <p><strong>Change reason:</strong> {memory.change_reason}</p>}
    <pre className="run-prose">{memory.content || '(Empty memory)'}</pre>
  </article>
}

function Timeline({ data }) {
  const run = data.run
  const job = data.alert_job
  return <>
    <RunPanel title="Execution lifecycle">
      <ol className="run-lifecycle">
        <li><span>Queued</span><time>{formatMonitorDate(run.created_at)}</time></li>
        <li><span>Research started</span><time>{run.started_at ? formatMonitorDate(run.started_at) : 'Not claimed'}</time></li>
        <li><span>Research {humanize(run.status).toLowerCase()}</span><time>{run.completed_at ? formatMonitorDate(run.completed_at) : 'No terminal transition yet'}</time></li>
        <li><span>Alert processing: {job ? humanize(job.status) : 'Not evaluated'}</span><time>{job?.completed_at ? formatMonitorDate(job.completed_at) : job?.status === 'pending' ? `Eligible after ${formatMonitorDate(job.next_attempt_at)}` : 'No completion recorded'}</time></li>
      </ol>
      {run.error_code && <Notice>Research error: {run.error_code}</Notice>}
      {job?.error_code && <Notice>Composition error: {job.error_code}. Research may already have succeeded.</Notice>}
      {job?.lease_expires_at && <p className="run-muted">Composition lease expires {formatMonitorDate(job.lease_expires_at)}. An expired lease is eligible for recovery; it does not prove the original worker stopped.</p>}
    </RunPanel>
    <RunPanel title="Recorded model requests" aside={<span className="run-muted">{data.model_calls.length} captured</span>}>
      <p className="run-muted">These are actual application request bodies. Authentication headers and raw provider response text are not captured. A completed request can still fail subsequent parsing or validation.</p>
      {!data.model_calls.length && <div className="run-empty"><Icon name="journal-text" /><h3>No request traces recorded</h3><p>This run may predate request tracing, use an offline fixture, or have not reached a provider request. The saved input snapshot remains available; it is not a reconstructed request log.</p></div>}
      <div className="run-call-list">{data.model_calls.map((call, index) => {
        const usage = call.response_metadata?.usage
        return <details className="run-call" key={call.id}>
          <summary><span className="run-call-number">{index + 1}</span><span><strong>{runStages[call.stage] || call.stage}</strong><small>{call.model} · attempt {call.attempt_number} · {formatMonitorDate(call.created_at)}</small></span><span className="run-call-right"><RunBadge status={call.status} /><small>{duration(call.duration_ms === null ? null : call.duration_ms / 1000)}</small></span></summary>
          <div className="run-call-body">
            {call.status === 'running' && <p className="run-muted">This request started, but no completion has been recorded. A worker interruption can leave this state behind.</p>}
            <dl className="run-facts"><div><dt>HTTP status</dt><dd>{call.http_status ?? 'No response recorded'}</dd></div><div><dt>Input tokens</dt><dd>{usage?.input_tokens?.toLocaleString() ?? 'Not reported'}</dd></div><div><dt>Output tokens</dt><dd>{usage?.output_tokens?.toLocaleString() ?? 'Not reported'}</dd></div><div><dt>Completed</dt><dd>{call.completed_at ? formatMonitorDate(call.completed_at) : 'No completion recorded'}</dd></div></dl>
            {call.error_code && <Notice>{call.error_code}</Notice>}
            <RunJson title="Exact input sent to the model" value={parseInput(call.request_payload.input)} />
            <RunJson title="Instructions sent to the model" value={call.request_payload.instructions || '(No instructions field)'} />
            <RunJson title="Complete request body, including schema and tools" value={call.request_payload} />
            <RunJson title="Response status, usage and provider identifiers" value={call.response_metadata || { note: 'No response metadata recorded' }} />
          </div>
        </details>
      })}</div>
    </RunPanel>
  </>
}

function Inputs({ data }) {
  const policy = data.context_policy
  const history = data.run.context_snapshot.history
  return <>
    <RunPanel title="Objective used for this run" aside={<span className="run-version">Configuration v{data.run.monitor_version}</span>}>
      <p className="run-prose">{data.run.objective_snapshot}</p>
      <p className="run-muted">Snapshot phase: {data.snapshot_phase === 'enqueue' ? 'Enqueue-time; this run has not started.' : 'Captured for execution.'}</p>
      {data.monitor.version !== data.run.monitor_version && <p className="run-warning">The monitor is now at configuration v{data.monitor.version}. Current configuration is not a historical record of this run.</p>}
      {data.monitor.objective !== data.run.objective_snapshot && <RunJson title="Current monitor objective (different from run input)" value={data.monitor.objective} />}
    </RunPanel>
    <RunPanel title="Captured context snapshot">
      <div className="run-inline-stats"><span>{data.memories_used.length} memory snapshots</span><span>{history?.observations?.length ?? 'Unknown'} historical observations</span><span>{history?.published_alerts?.length ?? 'Unknown'} prior published alerts</span></div>
      <RunJson title="Complete saved run context" value={data.run.context_snapshot} />
      {history && <RunJson title="Historical evidence and alerts selected for the run" value={history} />}
      <p className="run-muted">The run snapshot contains backend metadata too. Check an individual request in Execution & requests to see precisely which fields were actually sent.</p>
    </RunPanel>
    <RunPanel title="Context passed and excluded by the current worker">
      <p className="run-muted">{policy.note}</p>
      <div className="run-table-scroll"><table className="run-table run-policy-table"><thead><tr><th>Request stage</th><th>Direct inputs</th></tr></thead><tbody>{Object.entries(policy.request_inputs).map(([stage, fields]) => <tr key={stage}><th>{runStages[stage]}</th><td>{fields.join(' · ')}</td></tr>)}</tbody></table></div>
      <dl className="run-facts run-exclusions">
        <div><dt>Shared personal profile</dt><dd>Not passed separately. {policy.personal_profile.present_now ? 'A profile memory exists now.' : 'No profile memory exists now.'}</dd></div>
        <div><dt>Chat messages</dt><dd>Not passed separately. {policy.chat_messages.count_now} messages currently stored.</dd></div>
        <div><dt>Chat summary</dt><dd>Not passed separately. {policy.chat_summary.present_now ? 'A summary exists now.' : 'No summary exists now.'}</dd></div>
      </dl>
      <p className="run-muted">Presence and counts above describe current storage, not what existed historically. Input text can reflect prior research context even when that context was not supplied as a separate field.</p>
    </RunPanel>
  </>
}

function Memories({ data }) {
  const current = new Map(data.current_memories.map((memory) => [memory.id, memory]))
  return <>
    <RunPanel title="Memory inputs captured for this run">
      <p className="run-muted">Historical content and versions from the run snapshot, before its knowledge merge.</p>
      {!data.memories_used.length && <p>No memory snapshots are stored for this run.</p>}
      {data.memories_used.map((memory, index) => <MemoryRecord key={memory.memory_id || index} memory={memory} current={current.get(memory.memory_id)} />)}
    </RunPanel>
    <RunPanel title="Knowledge revisions produced by this run">
      {!data.memory_changes.length && <p>No accepted memory revisions are linked to this run. A merge may have returned unchanged content, or the run may not have completed a merge.</p>}
      {data.memory_changes.map((memory) => <MemoryRecord key={memory.id} memory={memory} />)}
    </RunPanel>
    {data.alert_job && <RunPanel title="Accepted post-merge state for alert processing">
      <p className="run-muted">Used to revalidate composition. This is separate from the earlier research input snapshot; inspect the recorded composition request for the fields sent to the composer.</p>
      <RunJson title="Composition validation snapshot" value={data.alert_job.input_snapshot} />
    </RunPanel>}
    <RunPanel title="Current monitor memories">
      <p className="run-warning">These are current values and may have changed after this run. They do not replace its historical snapshots.</p>
      {data.current_memories.map((memory) => <MemoryRecord key={memory.id} memory={memory} />)}
    </RunPanel>
  </>
}

function Decisions({ data }) {
  const job = data.alert_job
  return <>
    <RunPanel title="Alert processing" aside={<RunBadge status={job?.status} />}>
      {!job ? <p>No alert evaluation outcome has been saved for this run.</p> : <>
        <dl className="run-facts"><div><dt>Outcome reason</dt><dd>{humanize(job.reason_code)}</dd></div><div><dt>Attempts</dt><dd>{job.attempt_count}</dd></div><div><dt>Next eligible attempt</dt><dd>{job.status === 'pending' ? formatMonitorDate(job.next_attempt_at) : 'No pending retry'}</dd></div><div><dt>Error</dt><dd>{job.error_code || 'None recorded'}</dd></div></dl>
        {job.input_snapshot.decision_reason && <p><strong>Final model reason:</strong> {job.input_snapshot.decision_reason}</p>}
        <RunJson title="All alert-processing fields" value={job} />
      </>}
      <p className="run-muted">Empty or all-false decisions skip the smaller-model request. Positive decisions can still be removed as duplicates or excluded by the final composer. Only published developments count as notified.</p>
    </RunPanel>
    <RunPanel title="Saved observation decisions" aside={<span>{data.candidates.length} decisions</span>}>
      {!data.candidates.length && <p>No observation decisions were saved. Check the run and job outcome to distinguish an empty result from a failure or an unevaluated run.</p>}
      {data.candidates.map((candidate) => <article className="run-decision" key={candidate.id}>
        <header><h3>{candidate.observation_ref}</h3><div className="run-badges"><RunBadge status={candidate.should_alert ? 'succeeded' : 'skipped'} /><RunBadge status={candidate.status} /></div></header>
        <p><strong>should_alert:</strong> {String(candidate.should_alert)}</p>
        <p><strong>What changed:</strong> {candidate.what_changed}</p><p><strong>Why it matters:</strong> {candidate.why_it_matters}</p>
        <dl className="run-facts"><div><dt>Development key</dt><dd><code>{candidate.development_key || 'null'}</code></dd></div><div><dt>Observation ID</dt><dd><RunId value={candidate.observation_id} /></dd></div></dl>
      </article>)}
    </RunPanel>
  </>
}

function Alerts({ data }) {
  return <RunPanel title="Digests published by this run" aside={<span>{data.alerts.length} published</span>}>
    {!data.alerts.length && <div className="run-empty"><Icon name="bell-slash" /><h3>No published alert</h3><p>Alert processing is {humanize(data.alert_job?.status).toLowerCase()}. Review decisions for the recorded reason.</p></div>}
    {data.alerts.map((alert) => <article className="run-published-alert" key={alert.id}>
      <h3>{alert.title}</h3><RunId value={alert.id} /><p className="run-prose">{alert.body}</p>
      <dl className="run-facts"><div><dt>Published</dt><dd>{formatMonitorDate(alert.created_at)}</dd></div><div><dt>Read</dt><dd>{alert.read_at ? formatMonitorDate(alert.read_at) : 'Unread'}</dd></div><div><dt>Legacy dismissed state</dt><dd>{alert.dismissed_at ? formatMonitorDate(alert.dismissed_at) : 'Not dismissed'}</dd></div></dl>
      <h4>Included evidence</h4>{alert.observations.map((observation) => <Evidence key={observation.id} observation={observation} />)}
    </article>)}
    <p className="run-muted">Inspecting this page does not mark the account owner's alerts as read.</p>
  </RunPanel>
}

export default function AdminRunDetail({ runId }) {
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('timeline')
  const [live, setLive] = useState(true)
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    let active = true
    let timer
    async function load() {
      try {
        const data = await getAdminRun(runId)
        if (active) setResult({ data, error: '', updated: new Date() })
      } catch (error) {
        if (active) setResult((previous) => ({ ...previous, error: error.message }))
      }
      if (active && live) timer = window.setTimeout(load, 5000)
    }
    load()
    return () => { active = false; window.clearTimeout(timer) }
  }, [runId, live, refresh])
  const data = result?.data
  const usage = tokenUsage(data?.model_calls || [])
  const run = data?.run
  const elapsed = run?.started_at ? ((run.completed_at ? new Date(run.completed_at) : new Date()) - new Date(run.started_at)) / 1000 : null
  return <div className="run-dashboard run-inspector">
    <Link className="run-back" to="/admin/runs"><Icon name="arrow-left" /> All monitor runs</Link>
    <PageHeading eyebrow="ADMINISTRATION / EXECUTION DETAIL" title={`Run ${shortId(runId)}`}
      action={<div className="run-refresh-controls"><label><input type="checkbox" checked={live} onChange={(event) => setLive(event.target.checked)} /> Live refresh</label><button className="btn btn-outline-primary" onClick={() => setRefresh((value) => value + 1)}><Icon name="arrow-clockwise" /> Refresh</button></div>}>
      Historical inputs, actual request traces, accepted knowledge, evidence and publication outcomes.
    </PageHeading>
    <Notice>{result?.error}</Notice>
    {!result && <LoadingState label="Loading run details" />}
    {data && <>
      <section className="card run-identity"><div><span className="run-label">EXECUTION</span><RunId value={run.id} /><div className="run-badges"><RunBadge status={run.status} /><span>{humanize(run.trigger)} · research attempt {run.attempt_count}</span><RunBadge status={data.alert_job?.status} /></div></div><div><span className="run-label">ACCOUNT</span><strong>{data.owner.first_name} {data.owner.last_name}</strong><span>{data.owner.email}</span><Link to={`/admin/runs?user_id=${data.owner.id}`}>Account #{data.owner.id} · {data.owner.role}</Link>{data.owner.banned && <span className="run-warning">Account currently banned</span>}</div><div><span className="run-label">PARENT MONITOR</span><strong>{data.monitor.name}</strong><RunId value={data.monitor.id} /><span>{data.monitor_deleted_at ? `Soft-deleted ${formatMonitorDate(data.monitor_deleted_at)}` : humanize(data.monitor.status)}</span></div></section>
      <div className="run-metrics run-detail-metrics"><RunMetric label="Research duration" value={duration(elapsed)} note={run.completed_at ? 'Started to terminal transition' : 'Elapsed since claim'} /><RunMetric label="Observations / sources" value={`${data.observations.length} / ${data.observations.reduce((sum, item) => sum + item.sources.length, 0)}`} note="Saved evidence records" tone="teal" /><RunMetric label="Recorded input tokens" value={usage.measured ? usage.input.toLocaleString() : '—'} note={`${usage.measured} of ${data.model_calls.length} requests reported usage`} /><RunMetric label="Recorded output tokens" value={usage.measured ? usage.output.toLocaleString() : '—'} note="Provider totals, including non-visible tokens" tone="amber" /></div>
      <nav className="run-tabs" aria-label="Run inspection sections">{sections.map(([key, label]) => <button key={key} type="button" aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>{label}</button>)}</nav>
      <div className="run-detail-panels">
        {tab === 'timeline' && <Timeline data={data} />}
        {tab === 'inputs' && <Inputs data={data} />}
        {tab === 'memories' && <Memories data={data} />}
        {tab === 'observations' && <RunPanel title="Observations saved by this run" aside={<span>{data.observations.length} observations</span>}>{data.observations.length ? data.observations.map((observation) => <Evidence key={observation.id} observation={observation} />) : <p>No observations were saved. A successful check may have no findings; a failed check may have rolled back its outputs.</p>}</RunPanel>}
        {tab === 'decisions' && <Decisions data={data} />}
        {tab === 'alerts' && <Alerts data={data} />}
      </div>
      <RunPanel title="Execution identifiers and snapshots"><dl className="run-facts"><div><dt>Idempotency key</dt><dd><code>{data.idempotency_key}</code></dd></div><div><dt>Scheduled for</dt><dd>{run.scheduled_for ? formatMonitorDate(run.scheduled_for) : 'Not a scheduled slot'}</dd></div><div><dt>Last refreshed</dt><dd>{result.updated.toLocaleTimeString()}</dd></div></dl><RunJson title="Full saved run record" value={run} /></RunPanel>
    </>}
  </div>
}
