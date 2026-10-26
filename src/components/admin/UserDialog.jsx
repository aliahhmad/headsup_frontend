import { useEffect, useRef, useState } from 'react'
import { api, validatePassword } from '../../lib/api'
import { Icon, Notice, PasswordField, Submit } from '../UI'
import ProfileFields from '../forms/ProfileFields'
import UserIdentity from './UserIdentity'

const actions = {
  edit: { title: 'Edit user', label: 'Save changes', icon: 'pencil' },
  promote: {
    title: 'Make this user an admin?',
    label: 'Make admin',
    icon: 'shield-check',
  },
  ban: { title: 'Ban this user?', label: 'Ban user', icon: 'slash-circle' },
  unban: {
    title: 'Restore this user’s access?',
    label: 'Unban user',
    icon: 'check-circle',
  },
  delete: { title: 'Delete this user?', label: 'Delete user', icon: 'trash3' },
}

export default function UserDialog({ selection, onClose, onSaved }) {
  const dialog = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { user, action } = selection
  const details = actions[action]
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      let updated
      if (action === 'edit') {
        const fields = Object.fromEntries(new FormData(event.currentTarget))
        for (const key of ['first_name', 'last_name', 'email'])
          fields[key] = fields[key].trim()
        if (!fields.first_name || !fields.last_name)
          throw new Error('Please enter a first and last name.')
        if (fields.password) validatePassword(fields.password)
        updated = await api(`/users/${user.id}`, {
          method: 'PUT',
          body: fields,
        })
      } else {
        const suffix = {
          promote: '/make-admin',
          ban: '/ban',
          unban: '/unban',
          delete: '',
        }[action]
        await api(`/users/${user.id}${suffix}`, {
          method: action === 'delete' ? 'DELETE' : 'POST',
        })
      }
      onSaved(updated)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="user-dialog"
      aria-labelledby="user-dialog-title"
      aria-describedby={
        action === 'edit' ? undefined : 'user-dialog-description'
      }
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="user-dialog-heading">
        <div>
          <p className="eyebrow">USER MANAGEMENT</p>
          <h2 id="user-dialog-title">{details.title}</h2>
        </div>
        <button
          type="button"
          className="btn icon-button"
          aria-label="Close dialog"
          disabled={busy}
          onClick={onClose}
        >
          <Icon name="x-lg" />
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="user-dialog-body">
          <UserIdentity user={user} className="mb-4" />
          <Notice>{error}</Notice>
          {action === 'edit' ? (
            <fieldset disabled={busy}>
              <ProfileFields user={user} admin />
              <PasswordField
                label="New password (optional)"
                autoComplete="new-password"
                required={false}
                minLength={8}
                hint="Leave blank to keep the current password. New passwords need at least 8 characters and at most 72 bytes."
              />
            </fieldset>
          ) : (
            <p id="user-dialog-description" className="user-dialog-description">
              {action === 'promote' &&
                'This person will be able to view, edit, ban, and delete other user accounts. Only grant admin access to someone you trust.'}
              {action === 'ban' &&
                'This person will lose access to HeadsUp. Their account will be kept, and you can restore access by unbanning them.'}
              {action === 'unban' &&
                'This person will be able to sign in again if their email address is verified.'}
              {action === 'delete' &&
                'This permanently deletes the account and its associated data. This action cannot be undone.'}
            </p>
          )}
        </div>
        <div className="user-dialog-footer">
          <button
            type="button"
            className="btn btn-light"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          {['ban', 'delete'].includes(action) ? (
            <button className="btn btn-danger" type="submit" disabled={busy}>
              <Icon name={details.icon} />
              {busy ? 'Please wait…' : details.label}
            </button>
          ) : (
            <Submit busy={busy}>{details.label}</Submit>
          )}
        </div>
      </form>
    </dialog>
  )
}
