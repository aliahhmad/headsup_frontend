import { useEffect, useRef, useState } from 'react'
import { api, validatePassword } from '../lib/api'
import { Field, Icon, Notice, PageHeading, PasswordField, Submit } from '../components/UI'

const PAGE_SIZE = 20
const fullName = (user) => `${user.first_name} ${user.last_name}`.trim()
const actions = {
  edit: { title: 'Edit user', label: 'Save changes', icon: 'pencil' },
  promote: { title: 'Make this user an admin?', label: 'Make admin', icon: 'shield-check' },
  ban: { title: 'Ban this user?', label: 'Ban user', icon: 'slash-circle' },
  unban: { title: 'Restore this user’s access?', label: 'Unban user', icon: 'check-circle' },
  delete: { title: 'Delete this user?', label: 'Delete user', icon: 'trash3' },
}

function UserDialog({ selection, onClose, onSaved }) {
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
        for (const key of ['first_name', 'last_name', 'email']) fields[key] = fields[key].trim()
        if (!fields.first_name || !fields.last_name)
          throw new Error('Please enter a first and last name.')
        if (fields.password) validatePassword(fields.password)
        updated = await api(`/users/${user.id}`, { method: 'PUT', body: fields })
      } else {
        const suffix = { promote: '/make-admin', ban: '/ban', unban: '/unban', delete: '' }[action]
        await api(`/users/${user.id}${suffix}`, { method: action === 'delete' ? 'DELETE' : 'POST' })
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
      aria-describedby={action === 'edit' ? undefined : 'user-dialog-description'}
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
        <button type="button" className="btn icon-button" aria-label="Close dialog" disabled={busy} onClick={onClose}>
          <Icon name="x-lg" />
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="user-dialog-body">
          <div className="admin-user-identity mb-4">
            <span className="avatar">{user.first_name?.[0]}{user.last_name?.[0]}</span>
            <div><strong>{fullName(user)}</strong><span>{user.email}</span></div>
          </div>
          <Notice>{error}</Notice>
          {action === 'edit' ? (
            <fieldset disabled={busy}>
              <div className="row gx-3">
                <Field id="first_name" label="First name" defaultValue={user.first_name} maxLength={30} className="col-sm-6" />
                <Field id="last_name" label="Last name" defaultValue={user.last_name} maxLength={50} className="col-sm-6" />
              </div>
              <Field id="email" label="Email address" type="email" defaultValue={user.email} maxLength={120} />
              <PasswordField label="New password (optional)" autoComplete="new-password" required={false} minLength={8} hint="Leave blank to keep the current password. New passwords need at least 8 characters and at most 72 bytes." />
            </fieldset>
          ) : (
            <p id="user-dialog-description" className="user-dialog-description">
              {action === 'promote' && 'This person will be able to view, edit, ban, and delete other user accounts. Only grant admin access to someone you trust.'}
              {action === 'ban' && 'This person will lose access to HeadsUp. Their account will be kept, and you can restore access by unbanning them.'}
              {action === 'unban' && 'This person will be able to sign in again if their email address is verified.'}
              {action === 'delete' && 'This permanently deletes the account and its API keys. This action cannot be undone.'}
            </p>
          )}
        </div>
        <div className="user-dialog-footer">
          <button type="button" className="btn btn-light" disabled={busy} onClick={onClose}>Cancel</button>
          {['ban', 'delete'].includes(action) ? (
            <button className="btn btn-danger" type="submit" disabled={busy}>
              <Icon name={details.icon} />{busy ? 'Please wait…' : details.label}
            </button>
          ) : <Submit busy={busy}>{details.label}</Submit>}
        </div>
      </form>
    </dialog>
  )
}

export default function AdminUsers({ currentUser, setCurrentUser }) {
  const [view, setView] = useState({ query: '', page: 1 })
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState(null)
  const [selection, setSelection] = useState(null)
  const [message, setMessage] = useState('')
  const requestKey = JSON.stringify([view.query, view.page, version])
  const loading = result?.key !== requestKey
  const data = loading ? null : result?.data
  const error = loading ? '' : result?.error

  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ page: String(view.page), size: String(PAGE_SIZE) })
    if (view.query) params.set('search_term', view.query)
    api(`/users/${view.query ? 'search' : ''}?${params}`)
      .then((response) => {
        if (!active) return
        const lastPage = Math.max(1, response.pages)
        if (view.page > lastPage) {
          setView((current) => ({ ...current, page: lastPage }))
          return
        }
        setResult({ key: requestKey, data: response })
      })
      .catch((err) => {
        if (active) setResult({ key: requestKey, error: err.message })
      })
    return () => { active = false }
  }, [view.query, view.page, requestKey])

  function saved(updated) {
    if (selection.action === 'edit' && selection.user.id === currentUser.id)
      setCurrentUser(updated)
    const messages = {
      edit: 'User details saved.', promote: 'Admin access granted.',
      ban: 'User banned.', unban: 'User access restored.', delete: 'User deleted.',
    }
    setMessage(messages[selection.action])
    setSelection(null)
    setVersion((value) => value + 1)
  }

  function search(event) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('search').trim()
    setView({ query, page: 1 })
    setVersion((value) => value + 1)
    setMessage('')
  }

  return (
    <>
      <PageHeading eyebrow="ADMINISTRATION" title="Manage users" action={
        <button className="btn btn-outline-primary flex-shrink-0" disabled={loading} onClick={() => setVersion((value) => value + 1)}>
          <Icon name="arrow-clockwise" />Refresh
        </button>
      }>
        Look after the people in HeadsUp. Manage their details and account access.
      </PageHeading>
      <Notice type="success">{message}</Notice>
      <section className="card admin-users-card" aria-labelledby="users-heading">
        <div className="keys-heading">
          <div>
            <h2 id="users-heading">User directory {data && <span className="count-badge">{data.total}</span>}</h2>
            <p>Search by name or email to find an account.</p>
          </div>
          <span className="tile-icon tone-blue"><Icon name="people" /></span>
        </div>
        <form className="admin-search" onSubmit={search} role="search" aria-label="Search users">
          <div className="admin-search-input">
            <Icon name="search" />
            <label className="visually-hidden" htmlFor="user-search">Search by name or email</label>
            <input className="form-control" type="search" id="user-search" name="search" placeholder="Search by name or email…" maxLength={100} />
          </div>
          <button className="btn btn-primary" type="submit">Search</button>
          {view.query && <button className="btn btn-light" type="reset" onClick={() => { setView({ query: '', page: 1 }); setMessage('') }}>Clear</button>}
        </form>
        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="empty-state"><span className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading users</span></span><p className="mt-3 mb-0">Loading the directory…</p></div>
          ) : error ? (
            <div className="empty-state">
              <Notice>{error}</Notice>
              <button className="btn btn-outline-primary" onClick={() => setVersion((value) => value + 1)}>Try again</button>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="person-search" /></span>
              <h3>{view.query ? 'No matching users.' : 'No users yet.'}</h3>
              <p>{view.query ? `No names or emails matched “${view.query}”. Try a different search.` : 'Registered accounts will appear here.'}</p>
            </div>
          ) : data && (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0 admin-users-table">
                  <caption className="visually-hidden">HeadsUp user accounts{view.query ? ` matching ${view.query}` : ''}</caption>
                  <thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Verification</th><th scope="col">Access</th><th scope="col" className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {data.items.map((user) => {
                      const self = user.id === currentUser.id
                      return (
                        <tr key={user.id}>
                          <td><div className="admin-user-identity">
                            <span className="avatar">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                            <div><strong>{fullName(user)} {self && <small className="admin-you">You</small>}</strong><span>{user.email}</span><small>ID {user.id}</small></div>
                          </div></td>
                          <td data-label="Role"><span className={`admin-role ${user.role === 'admin' ? 'admin-role-elevated' : ''}`}>{user.role === 'admin' && <Icon name="shield-check" />}{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
                          <td data-label="Verification"><span className={`status-badge ${user.verified ? '' : 'status-inactive'}`}><Icon name={user.verified ? 'check-circle' : 'clock'} />{user.verified ? 'Verified' : 'Unverified'}</span></td>
                          <td data-label="Access"><span className={`status-badge ${user.banned ? 'status-banned' : ''}`}><span />{user.banned ? 'Banned' : 'Allowed'}</span></td>
                          <td><div className="key-actions">
                            <button className="btn icon-button" title="Edit user" aria-label={`Edit ${user.email}`} onClick={() => setSelection({ user, action: 'edit' })}><Icon name="pencil" /></button>
                            {user.role !== 'admin' && <button className="btn icon-button" title="Make admin" aria-label={`Make ${user.email} an admin`} onClick={() => setSelection({ user, action: 'promote' })}><Icon name="shield-plus" /></button>}
                            <button className="btn icon-button" disabled={self} title={self ? 'You cannot ban your own account' : user.banned ? 'Unban user' : 'Ban user'} aria-label={`${user.banned ? 'Unban' : 'Ban'} ${user.email}`} onClick={() => setSelection({ user, action: user.banned ? 'unban' : 'ban' })}><Icon name={user.banned ? 'unlock' : 'slash-circle'} /></button>
                            <button className="btn icon-button delete-button" disabled={self} title={self ? 'You cannot delete your own account here' : 'Delete user'} aria-label={`Delete ${user.email}`} onClick={() => setSelection({ user, action: 'delete' })}><Icon name="trash3" /></button>
                          </div></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="admin-pagination">
                <span>{data.total ? (view.page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(view.page * PAGE_SIZE, data.total)} of {data.total} users{view.query ? ' found' : ''}</span>
                <nav aria-label="User directory pagination">
                  <button className="btn btn-outline-primary btn-sm" disabled={view.page <= 1} onClick={() => setView({ ...view, page: view.page - 1 })}><Icon name="chevron-left" />Previous</button>
                  <span>Page {view.page} of {Math.max(1, data.pages)}</span>
                  <button className="btn btn-outline-primary btn-sm" disabled={view.page >= data.pages} onClick={() => setView({ ...view, page: view.page + 1 })}>Next<Icon name="chevron-right" /></button>
                </nav>
              </div>
            </>
          )}
        </div>
      </section>
      <p className="key-footnote"><Icon name="shield-lock" />Your own account is protected from banning and deletion on this page.</p>
      {selection && <UserDialog selection={selection} onClose={() => setSelection(null)} onSaved={saved} />}
    </>
  )
}
