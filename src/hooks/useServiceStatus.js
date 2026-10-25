import { useEffect, useRef, useState } from 'react'
import { checkHeartbeat } from '../lib/api'

const CHECK_INTERVAL = 15_000
const CHECK_TIMEOUT = 5_000

export default function useServiceStatus() {
  const [unavailable, setUnavailable] = useState(false)
  const [retrying, setRetrying] = useState(false)
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

  function retry() {
    setRetrying(true)
    checkNow.current?.()
  }

  return { unavailable, retrying, retry }
}
