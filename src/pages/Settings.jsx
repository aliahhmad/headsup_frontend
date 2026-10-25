import { useState } from 'react'
import { api, getUserId, validatePassword } from '../lib/api'
import {
  Field,
  Icon,
  Notice,
  PageHeading,
  PasswordField,
  Submit,
} from '../components/UI'

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
          <section className="card settings-card">
            <div className="settings-card-heading">
              <span className="tile-icon tone-blue">
                <Icon name={security ? 'shield-lock' : 'person'} />
              </span>
              <div>
                <h2>{security ? 'Change password' : 'Personal information'}</h2>
                <p>
                  {security
                    ? 'A fresh password for your personal space.'
                    : 'Manage your name and email address.'}
                </p>
              </div>
            </div>
            <div className="settings-card-body">
              <Notice>{error}</Notice>
              <Notice type="success">{success}</Notice>
              <form onSubmit={submit}>
                {security ? (
                  <>
                    <PasswordField
                      label="New password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      minLength={8}
                      hint="At least 8 characters. Maximum 72 bytes."
                    />
                    <PasswordField
                      id="confirm_password"
                      label="Confirm new password"
                      autoComplete="new-password"
                      placeholder="Enter your new password again"
                      minLength={8}
                    />
                  </>
                ) : (
                  <>
                    <div className="profile-avatar-row">
                      <span className="avatar avatar-lg">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </span>
                      <div>
                        <strong>
                          {user.first_name} {user.last_name}
                        </strong>
                        <span>Your personal account</span>
                      </div>
                    </div>
                    <div className="row gx-3">
                      <Field
                        id="first_name"
                        label="First name"
                        defaultValue={user.first_name}
                        autoComplete="given-name"
                        maxLength={30}
                        className="col-sm-6"
                      />
                      <Field
                        id="last_name"
                        label="Last name"
                        defaultValue={user.last_name}
                        autoComplete="family-name"
                        maxLength={50}
                        className="col-sm-6"
                      />
                    </div>
                    <Field
                      id="email"
                      label="Email address"
                      type="email"
                      defaultValue={user.email}
                      autoComplete="email"
                    />
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
            </div>
          </section>
        </div>
        <div className="col-xl-4">
          <aside className="tip-card">
            <Icon name={security ? 'lightbulb' : 'fingerprint'} />
            <h3>
              {security
                ? 'A stronger kind of password.'
                : 'Your space, your details.'}
            </h3>
            <p>
              {security
                ? 'Use a unique password you don’t use anywhere else. A longer passphrase is easier to remember and harder to guess.'
                : 'Keep your email current. It’s where you’ll receive account verification and password recovery links.'}
            </p>
            <div className="tip-divider" />
            <span>
              <Icon name="shield-check" /> A little care goes a long way.
            </span>
          </aside>
        </div>
      </div>
    </>
  )
}
