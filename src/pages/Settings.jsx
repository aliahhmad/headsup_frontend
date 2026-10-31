import ProfileFields from '../components/forms/ProfileFields'
import NewPasswordFields from '../components/forms/NewPasswordFields'
import Avatar from '../components/ui/Avatar'
import SettingsCard from '../components/ui/SettingsCard'
import AccountTip from '../components/forms/AccountTip'
import AlertEmailSettings from '../components/forms/AlertEmailSettings'
import { useState } from 'react'
import { api, getUserId, validatePassword } from '../lib/api'
import { Icon, Notice, PageHeading, Submit } from '../components/UI'

export default function Settings({ user, setUser, security }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form))
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      if (security) {
        validatePassword(fields.password)
        if (fields.password !== fields.confirm_password)
          throw new Error('Your passwords don’t match. Please try again.')
        await api(`/users/${getUserId()}/password`, {
          method: 'POST',
          body: { password: fields.password },
        })
        form.reset()
        setSuccess('Your password has been updated.')
      } else {
        for (const key of Object.keys(fields)) fields[key] = fields[key].trim()
        if (!fields.first_name || !fields.last_name)
          throw new Error('Please enter your first and last name.')
        // The API requires this field; an empty value preserves the current password.
        const updated = await api(`/users/${getUserId()}`, {
          method: 'PUT',
          body: { ...fields, password: '' },
        })
        setUser(updated)
        setSuccess('Your profile has been saved.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title={security ? 'Peace of mind, built in.' : 'A little more you.'}
      >
        {security
          ? 'Keep your account protected with a strong password.'
          : 'The details that make this space yours.'}
      </PageHeading>
      <div className="row g-4">
        <div className="col-xl-8">
          <SettingsCard
            icon={security ? 'shield-lock' : 'person'}
            title={security ? 'Change password' : 'Personal information'}
            description={
              security
                ? 'A fresh password for your personal space.'
                : 'Manage your name and email address.'
            }
          >
            <Notice>{error}</Notice>
            <Notice type="success">{success}</Notice>
            <form onSubmit={submit}>
              {security ? (
                <NewPasswordFields />
              ) : (
                <>
                  <div className="profile-avatar-row">
                    <Avatar user={user} large />
                    <div>
                      <strong>
                        {user.first_name} {user.last_name}
                      </strong>
                      <span>Your personal account</span>
                    </div>
                  </div>
                  <ProfileFields user={user} />
                </>
              )}
              <div className="settings-actions">
                <span>
                  <Icon name="lock" />{' '}
                  {security
                    ? 'Keep your password just for you.'
                    : 'Your details stay in your account.'}
                </span>
                <Submit busy={busy}>
                  {security ? 'Update password' : 'Save changes'}
                  <Icon name="arrow-right" />
                </Submit>
              </div>
            </form>
          </SettingsCard>
          {!security && <AlertEmailSettings key={user.email} email={user.email} />}
        </div>
        <div className="col-xl-4">
          <AccountTip security={security} />
        </div>
      </div>
    </>
  )
}
