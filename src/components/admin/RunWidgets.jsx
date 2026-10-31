import { useState } from 'react'
import { Icon } from '../UI'
import { humanize } from '../../lib/runDashboard'

export function RunBadge({ status }) {
  return <span className={`run-badge run-badge-${status || 'unknown'}`}>{humanize(status)}</span>
}

export function RunJson({ title, value, open = false }) {
  return (
    <details className="run-json" open={open || undefined}>
      <summary>{title}</summary>
      <pre>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>
    </details>
  )
}

export function RunId({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <span className="run-copy-id">
      <code>{value}</code>
      <button type="button" className="btn icon-button" aria-label="Copy identifier"
        onClick={async () => {
          try { await navigator.clipboard.writeText(value); setCopied(true) }
          catch { setCopied(false) }
        }}><Icon name={copied ? 'check2' : 'clipboard'} /></button>
    </span>
  )
}

export function RunMetric({ label, value, note, tone = 'blue' }) {
  return <div className={`run-metric run-metric-${tone}`}>
    <span>{label}</span><strong>{value}</strong><small>{note}</small>
  </div>
}

export function RunPanel({ title, children, aside, id }) {
  return <section className="card run-panel" id={id}>
    <header><h2>{title}</h2>{aside}</header>
    <div className="run-panel-body">{children}</div>
  </section>
}
