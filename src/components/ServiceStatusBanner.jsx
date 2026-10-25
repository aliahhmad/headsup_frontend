import { useLayoutEffect, useRef } from 'react'
import useServiceStatus from '../hooks/useServiceStatus'
import { Icon } from './UI'

export default function ServiceStatusBanner() {
  const { unavailable, retrying, retry } = useServiceStatus()
  const banner = useRef(null)

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
          <span>
            Some features may not work. We’ll reconnect automatically.
          </span>
        </div>
      </div>
      <button
        type="button"
        className="service-status-retry"
        disabled={retrying}
        onClick={retry}
      >
        {retrying ? (
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />
        ) : (
          <Icon name="arrow-clockwise" />
        )}
        {retrying ? 'Checking…' : 'Check again'}
      </button>
    </div>
  )
}
