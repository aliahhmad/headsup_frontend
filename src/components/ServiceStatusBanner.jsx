import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { checkHeartbeat } from '../lib/api'
import { Icon } from './UI'

const CHECK_INTERVAL = 15_000
const CHECK_TIMEOUT = 5_000

export default function ServiceStatusBanner() {
  const [unavailable, setUnavailable] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const banner = useRef(null)
  const checkNow = useRef(null)

  useEffect(() => {
    let active = true
    let controller = null
    let nextCheck
    let timeout

    async function check() {
      if (!active || controller) return
      clearTimeout(nextCheck)
      controller = new AbortController()
      timeout = setTimeout(() => controller?.abort(), CHECK_TIMEOUT)
      try {
        const available = await checkHeartbeat(controller.signal)
        if (active) setUnavailable(!available)
      } catch {
        if (active) setUnavailable(true)
      } finally {
        clearTimeout(timeout)
        controller = null
        if (active) {
          setRetrying(false)
          nextCheck = setTimeout(check, CHECK_INTERVAL)
        }
      }
    }

    function checkWhenVisible() {
      if (document.visibilityState === 'visible') check()
    }

    checkNow.current = check
    check()
    window.addEventListener('online', check)
    window.addEventListener('offline', check)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', checkWhenVisible)
    return () => {
      active = false
      clearTimeout(nextCheck)
      clearTimeout(timeout)
      controller?.abort()
      checkNow.current = null
      window.removeEventListener('online', check)
      window.removeEventListener('offline', check)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', checkWhenVisible)
    }
  }, [])

  useLayoutEffect(() => {
    if (!unavailable) return
    const element = banner.current
    function reserveSpace() {
      document.documentElement.style.setProperty(
        '--service-banner-height',
        `${element.getBoundingClientRect().height}px`,
      )
    }
    reserveSpace()
    const observer = new ResizeObserver(reserveSpace)
    observer.observe(element)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--service-banner-height')
    }
  }, [unavailable])

  if (!unavailable) return null

  return (
    <div className="service-status-banner" role="alert" ref={banner}>
      <div className="service-status-copy">
        <Icon name="exclamation-triangle" />
        <div>
          <strong>HeadsUp is temporarily unavailable.</strong>
          <span>Some features may not work. We’ll reconnect automatically.</span>
        </div>
      </div>
      <button
        type="button"
        className="service-status-retry"
        disabled={retrying}
        onClick={() => {
          setRetrying(true)
          checkNow.current?.()
        }}
      >
        {retrying ? (
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        ) : <Icon name="arrow-clockwise" />}
        {retrying ? 'Checking…' : 'Check again'}
      </button>
    </div>
  )
}
