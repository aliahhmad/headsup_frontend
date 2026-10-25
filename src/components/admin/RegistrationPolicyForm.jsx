import { useState } from 'react'
import { Icon, Submit } from '../UI'
import StatusBadge from '../ui/StatusBadge'

export default function RegistrationPolicyForm({ settings, busy, onSave }) {
  const [draft, setDraft] = useState(null)
  const required = draft ?? settings.referral_code_required
  const changed = required !== settings.referral_code_required

  async function submit(event) {
    event.preventDefault()
    if (busy || !changed) return
    if (await onSave(required)) setDraft(null)
  }

  return (
    <form onSubmit={submit}>
      <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
        <span className="form-label mb-0">Current signup access</span>
        <StatusBadge
          variant={settings.referral_code_required ? '' : 'inactive'}
        >
          {settings.referral_code_required ? 'Invite-only' : 'Open signup'}
        </StatusBadge>
      </div>
      <div className="form-check form-switch mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="require-referral-code"
          checked={required}
          disabled={busy || (!settings.referral_code_configured && !required)}
          onChange={(event) => setDraft(event.target.checked)}
          aria-describedby="referral-policy-description"
        />
        <label className="form-check-label" htmlFor="require-referral-code">
          Require a referral code to sign up
        </label>
      </div>
      <p id="referral-policy-description" className="form-text mb-4">
        {required
          ? 'Only people with your invitation code can create an account.'
          : 'Anyone can create an account without an invitation code.'}
      </p>
      {!settings.referral_code_configured && (
        <p className="form-text mb-4">
          Configure a referral code on the server before enabling invite-only
          signup.
        </p>
      )}
      <div className="settings-actions">
        <span>
          <Icon name="check-circle" />
          Changes take effect when you save.
        </span>
        <Submit busy={busy} disabled={!changed} busyLabel="Saving…">
          Save changes
          <Icon name="arrow-right" />
        </Submit>
      </div>
    </form>
  )
}
