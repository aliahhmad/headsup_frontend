const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const SESSION_KEY = 'headsup.session'
let refreshRequest

export async function checkHeartbeat(signal) {
  const response = await fetch(`${API_URL}/heartbeat`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    credentials: 'omit',
    signal,
  })
  if (!response.ok) return false
  const data = await response.json()
  return data?.status === 'ok'
}

export function getSession() {
  try {
    return JSON.parse(
      sessionStorage.getItem(SESSION_KEY) ||
        localStorage.getItem(SESSION_KEY) ||
        'null',
    )
  } catch {
    return null
  }
}

export function saveSession(session, remember = false) {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
  if (session)
    (remember ? localStorage : sessionStorage).setItem(
      SESSION_KEY,
      JSON.stringify(session),
    )
  window.dispatchEvent(new Event('headsup:session'))
}

export function getUserId() {
  try {
    const payload = getSession()
      .token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    return JSON.parse(atob(payload)).sub
  } catch {
    throw new Error('Your session is invalid. Please sign in again.')
  }
}

async function send(path, options = {}) {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...options,
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error(
      'We couldn’t reach HeadsUp. Check your connection and try again.',
    )
  }
}

async function parse(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail
          .map((item) => `${item.loc?.at(-1) || 'Field'}: ${item.msg}`)
          .join('. ')
      : typeof detail === 'string'
        ? detail
        : 'Something went wrong. Please try again.'
    throw new Error(
      response.status === 429
        ? 'Too many attempts. Please wait a moment and try again.'
        : message,
    )
  }
  return data
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const session = auth ? getSession() : null
  if (session?.token) headers.Authorization = `Bearer ${session.token}`
  const options = {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  }
  let response = await send(path, options)
  if (response.status === 401 && session?.refresh) {
    if (!refreshRequest) {
      refreshRequest = (async () => {
        const renewed = await parse(
          await send('/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: session.refresh }),
          }),
        )
        if (getSession()?.refresh !== session.refresh)
          throw new Error('Please sign in again.')
        const storage = localStorage.getItem(SESSION_KEY)
          ? localStorage
          : sessionStorage
        storage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...session, token: renewed.token }),
        )
        return renewed.token
      })()
        .catch((error) => {
          saveSession(null)
          throw error
        })
        .finally(() => {
          refreshRequest = null
        })
    }
    headers.Authorization = `Bearer ${await refreshRequest}`
    response = await send(path, options)
  }
  if (response.status === 401 && session) saveSession(null)
  return parse(response)
}

export function validatePassword(password) {
  if (password.length < 8)
    throw new Error('Use a password with at least 8 characters.')
  if (new TextEncoder().encode(password).length > 72)
    throw new Error(
      'Your password must be 72 bytes or fewer. Try a shorter password.',
    )
}
