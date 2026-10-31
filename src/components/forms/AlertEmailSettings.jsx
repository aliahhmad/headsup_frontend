import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { Icon, Notice, Submit } from '../UI'
import SettingsCard from '../ui/SettingsCard'
import LoadingState from '../ui/LoadingState'

export default function AlertEmailSettings({ email }) {
  const [result, setResult] = useState(null)
  const [draft, setDraft] = useState(null)
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const active = useRef(false)
  const submitting = useRef(false)
  const enabled = draft ?? result?.settings?.email_alerts_enabled ?? false
  const changed = Boolean(result?.settings) && enabled !== result.settings.email_alerts_enabled

  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  useEffect(() => {
    let current = true
    api('/users/me/notification-preferences')
      .then((settings) => { if (current) { setResult({ settings }); setDraft(null) } })
      .catch((error) => { if (current) setResult({ error: error.message }) })
    return () => { current = false }
  }, [retry])

  async function save(event) {
    event.preventDefault()
    if (!changed || submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const settings = await api('/users/me/notification-preferences', { method: 'PATCH', body: { email_alerts_enabled: enabled } })
      if (active.current) {
        setResult({ settings })
        setDraft(null)
        setMessage(settings.email_alerts_enabled
          ? 'Email updates are on for new published alerts.'
          : 'Email updates are off. Your in-app notifications stay available.')
      }
    } catch (error) {
      if (active.current) setError(error.message)
    } finally {
      submitting.current = false
      if (active.current) setBusy(false)
    }
  }

  return <div className="mt-4" id="email-updates">
    <SettingsCard icon="envelope-paper" title="Email updates" description="A useful update in your inbox when a monitor publishes a new alert.">
      <Notice>{error || result?.error}</Notice>
      <Notice type="success">{message}</Notice>
      {!result ? <LoadingState label="Loading email preferences" /> : result.error ? (
        <button type="button" className="btn btn-outline-primary" onClick={() => { setResult(null); setRetry((value) => value + 1) }}>Try again</button>
      ) : <form onSubmit={save}>
        <div className="form-check form-switch mb-3">
          <input id="email-alert-updates" className="form-check-input" type="checkbox" role="switch"
            checked={enabled} disabled={busy} onChange={(event) => { setDraft(event.target.checked); setMessage('') }} aria-describedby="email-alert-description" />
          <label className="form-check-label fw-semibold" htmlFor="email-alert-updates">Email me new alert updates</label>
        </div>
        <p id="email-alert-description" className="text-secondary mb-3">Get the published update, monitor details and source links at <strong className="text-break">{email}</strong>. Each alert gets one email; monitor activations and pauses stay in the app.</p>
        <p className="form-text mb-4">Turning this off cancels emails waiting to be sent. An email already being sent may still arrive. Changing your account email turns this option off until you enable it again.</p>
        <div className="settings-actions">
          <span><Icon name="check-circle" /> Changes take effect when you save.</span>
          <Submit busy={busy} disabled={!changed} busyLabel="Saving…">Save email preference <Icon name="arrow-right" /></Submit>
        </div>
      </form>}
    </SettingsCard>
  </div>
}
