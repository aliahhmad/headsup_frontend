import { useEffect, useState } from 'react'
import { getReferralRequirement } from '../lib/registration'

export default function useRegistrationSettings(enabled) {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let active = true
    let checking = false
    async function load() {
      if (checking) return
      checking = true
      try {
        const required = await getReferralRequirement()
        if (active) setResult({ required })
      } catch (error) {
        if (active)
          setResult((current) =>
            current?.required !== undefined
              ? current
              : { error: error.message },
          )
      } finally {
        checking = false
      }
    }
    function checkWhenVisible() {
      if (document.visibilityState === 'visible') load()
    }
    load()
    window.addEventListener('focus', load)
    document.addEventListener('visibilitychange', checkWhenVisible)
    return () => {
      active = false
      window.removeEventListener('focus', load)
      document.removeEventListener('visibilitychange', checkWhenVisible)
    }
  }, [enabled, attempt])

  return {
    required: result?.required ?? false,
    loading: enabled && result === null,
    error: result?.error || '',
    async refresh() {
      const required = await getReferralRequirement()
      setResult({ required })
      return required
    },
    retry() {
      setResult(null)
      setAttempt((value) => value + 1)
    },
  }
}
