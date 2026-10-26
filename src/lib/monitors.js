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
  return configuration(await api(`/monitors/${encodeURIComponent(id)}`))
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
