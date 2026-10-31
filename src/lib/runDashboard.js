import { api } from './api'

export const runStages = {
  research: 'Web research', extraction: 'Observation extraction',
  knowledge: 'Knowledge & decisions', composition: 'Alert composition',
}

export function runParams(filters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined && value !== null) params.set(key, String(value))
  }
  return params
}

export function listAdminRuns(filters, page) {
  const params = runParams({ ...filters, page, size: 20 })
  return api(`/admin/monitor-runs?${params}`)
}

export function getRunSummary(filters) {
  return api(`/admin/monitor-runs/summary?${runParams(filters)}`)
}

export function getAdminRun(runId) {
  return api(`/admin/monitor-runs/${encodeURIComponent(runId)}`)
}

export function duration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.floor(seconds % 60)}s`
}

export function humanize(value) {
  if (!value) return 'Not evaluated'
  return value.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase())
}

export function shortId(id) {
  return id ? id.slice(0, 8) : '—'
}

export function tokenUsage(calls) {
  const measured = calls.filter((call) => (
    typeof call.response_metadata?.usage?.input_tokens === 'number'
    && typeof call.response_metadata?.usage?.output_tokens === 'number'
  ))
  return {
    measured: measured.length,
    input: measured.reduce((sum, call) => sum + (call.response_metadata.usage.input_tokens || 0), 0),
    output: measured.reduce((sum, call) => sum + (call.response_metadata.usage.output_tokens || 0), 0),
  }
}

export function localDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function utcDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : ''
}
