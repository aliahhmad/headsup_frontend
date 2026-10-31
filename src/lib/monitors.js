import { api } from './api'

// Only retain fields intended for the monitor screens. Detail responses also
// contain internal memory, chat summaries, and run snapshots; don't retain them.
function configuration(data) {
  return {
    id: data.id,
    name: data.name,
    objective: data.objective,
    status: data.status,
    check_interval_seconds: data.check_interval_seconds,
    next_run_at: data.next_run_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

function runStatus(data) {
  if (!data) return null
  return {
    id: data.id,
    status: data.status,
    created_at: data.created_at,
    started_at: data.started_at,
    completed_at: data.completed_at,
    alert_processing: data.alert_processing || null,
    alert: data.alert || null,
  }
}

export async function listMonitors({ page, size, status }) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.set('status', status)
  const data = await api(`/monitors?${params}`)
  return {
    items: data.items.map(configuration),
    total: data.total,
    pages: data.pages,
  }
}

export async function getMonitor(id) {
  const data = await api(`/monitors/${encodeURIComponent(id)}`)
  return { ...configuration(data), latest_run: runStatus(data.latest_run) }
}

export async function checkMonitor(id, clientRequestId) {
  const data = await api(`/monitors/${encodeURIComponent(id)}/checks`, {
    method: 'POST',
    body: { client_request_id: clientRequestId },
  })
  return runStatus(data)
}

export async function getMonitorRun(monitorId, runId) {
  return runStatus(
    await api(
      `/monitors/${encodeURIComponent(monitorId)}/runs/${encodeURIComponent(runId)}`,
    ),
  )
}

export function listMonitorAlerts(monitorId, page = 1) {
  return api(`/monitors/${encodeURIComponent(monitorId)}/alerts?page=${page}&size=10`)
}

export function getMonitorAlert(monitorId, alertId) {
  return api(`/monitors/${encodeURIComponent(monitorId)}/alerts/${encodeURIComponent(alertId)}`)
}

export function updateMonitorAlert(monitorId, alertId, changes) {
  return api(`/monitors/${encodeURIComponent(monitorId)}/alerts/${encodeURIComponent(alertId)}`, {
    method: 'PATCH', body: changes,
  })
}

export async function createMonitor(data) {
  const created = await api('/monitors', { method: 'POST', body: data })
  return { id: created.id }
}

export function formatCheckInterval(seconds) {
  for (const [divisor, unit] of [
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
    [1, 'second'],
  ]) {
    if (Number.isInteger(seconds / divisor) && seconds >= divisor) {
      const count = seconds / divisor
      return count === 1
        ? `Every ${unit}`
        : `Every ${count.toLocaleString()} ${unit}s`
    }
  }
  return 'Not configured'
}

export function formatMonitorDate(value) {
  if (!value) return 'Not scheduled'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
