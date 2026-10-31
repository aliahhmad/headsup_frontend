import { api } from './api'

export const notificationTypes = [
  { value: 'alert.published', label: 'Alerts', icon: 'bell', tone: 'blue' },
  { value: 'monitor.activated', label: 'Monitor activated', icon: 'play-circle', tone: 'teal' },
  { value: 'monitor.paused', label: 'Monitor paused', icon: 'pause-circle', tone: 'amber' },
]

export function notificationsChanged() {
  window.dispatchEvent(new Event('headsup:notifications'))
}

export function notificationCounts() { return api('/notifications/count') }

export function listNotifications({ page = 1, type = '', unread = false } = {}) {
  const params = new URLSearchParams({ page: String(page), size: '20', unread: String(unread) })
  if (type) params.set('type', type)
  return api(`/notifications?${params}`)
}

export async function updateNotification(id, body) {
  const result = await api(`/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', body })
  notificationsChanged()
  return result
}

export function markNotificationsSeen(ids) {
  return api('/notifications/seen', { method: 'POST', body: { ids } })
}
