import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Icon, Notice, PageHeading } from '../components/UI'
import RegistrationPolicyForm from '../components/admin/RegistrationPolicyForm'
import LoadingState from '../components/ui/LoadingState'
import SettingsCard from '../components/ui/SettingsCard'

export default function AdminSignupSettings() {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    api('/admin/registration/settings/')
      .then((settings) => {
        if (active) setResult({ settings })
      })
      .catch((error) => {
        if (active) setResult({ error: error.message })
      })
    return () => {
      active = false
    }
  }, [attempt])

  function retry() {
    setResult(null)
    setAttempt((value) => value + 1)
  }

  async function save(required) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const settings = await api('/admin/registration/settings/', {
        method: 'PATCH',
        body: { referral_code_required: required },
      })
      setResult({ settings })
      setMessage(
        settings.referral_code_required
          ? 'Invite-only signup is on. New accounts require a referral code.'
          : 'Invite-only signup is off. Anyone can create an account.',
      )
      return true
    } catch (error) {
      setError(error.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeading eyebrow="ADMINISTRATION" title="Signup settings">
        Choose who can create an account in your demo.
      </PageHeading>
      <div className="row g-4">
        <div className="col-xl-8">
          <SettingsCard
            icon="person-lock"
            title="Referral-only signup"
            description="Turn invitation codes on or off for new accounts."
          >
            <Notice>{error}</Notice>
            <Notice type="success">{message}</Notice>
            {!result ? (
              <LoadingState label="Loading signup settings" />
            ) : result.error ? (
              <>
                <Notice>{result.error}</Notice>
                <button className="btn btn-outline-primary" onClick={retry}>
                  Try again
                </button>
              </>
            ) : (
              <RegistrationPolicyForm
                settings={result.settings}
                busy={busy}
                onSave={save}
              />
            )}
          </SettingsCard>
        </div>
        <div className="col-xl-4">
          <aside className="tip-card">
            <Icon name="people" />
            <h3>You choose who joins.</h3>
            <p>
              Enable invitation codes for a private demo, or turn them off to
              welcome everyone. Existing accounts can sign in either way.
            </p>
            <div className="tip-divider" />
            <span>
              <Icon name="shield-check" />
              Only administrators can change this setting.
            </span>
          </aside>
        </div>
      </div>
    </>
  )
}
