import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Field, Icon, Notice, PageHeading, Submit } from '../components/UI'

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not used yet'

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rawKey, setRawKey] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    api('/users/keys')
      .then((data) => {
        if (active) {
          setKeys(data)
          setError('')
        }
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [retry])
  async function perform(action, success) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      if (success) setMessage(success)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  function create(event) {
    event.preventDefault()
    const name = new FormData(event.currentTarget).get('name').trim()
    if (!name) {
      setError('Give your key a name.')
      return
    }
    perform(async () => {
      const created = await api('/users/keys', {
        method: 'POST',
        body: { name },
      })
      const { key, ...metadata } = created
      setKeys((current) => [metadata, ...current])
      setRawKey(key)
      setCreating(false)
    })
  }
  function rename(event, key) {
    event.preventDefault()
    const name = new FormData(event.currentTarget).get('name').trim()
    if (!name) {
      setError('Give your key a name.')
      return
    }
    perform(async () => {
      const updated = await api(`/users/keys/${key.id}`, {
        method: 'PATCH',
        body: { name },
      })
      setKeys((current) =>
        current.map((item) => (item.id === key.id ? updated : item)),
      )
      setEditing(null)
    }, 'Key name updated.')
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR CONNECTIONS"
        title="Good things work together."
        action={
          <button
            className="btn btn-primary flex-shrink-0"
            onClick={() => {
              setCreating(!creating)
              setMessage('')
            }}
            disabled={busy || loading}
          >
            <Icon name={creating ? 'x-lg' : 'plus-lg'} />
            {creating ? 'Cancel' : 'Create API key'}
          </button>
        }
      >
        Manage the keys that connect your tools to HeadsUp.
      </PageHeading>
      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>
      {rawKey && (
        <section className="new-key-panel" aria-label="New API key">
          <div className="d-flex gap-3">
            <Icon name="key" />
            <div>
              <h2>Your new key is ready.</h2>
              <p>Copy it somewhere safe. You won’t be able to see it again.</p>
            </div>
          </div>
          <div className="key-copy-row">
            <code>{rawKey}</code>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() =>
                perform(async () => {
                  await navigator.clipboard.writeText(rawKey)
                }, 'API key copied.')
              }
            >
              <Icon name="copy" />
              Copy
            </button>
          </div>
          <button
            className="btn btn-link p-0 mt-3"
            onClick={() => {
              setRawKey('')
              setMessage('')
            }}
          >
            I’ve saved my key
            <Icon name="check2" />
          </button>
        </section>
      )}
      {creating && (
        <section className="card settings-card mb-4">
          <div className="settings-card-body">
            <h2 className="h5 mb-4">Create a new API key</h2>
            <form onSubmit={create}>
              <Field
                id="name"
                label="Key name"
                placeholder="e.g. My personal app"
                maxLength={50}
                autoComplete="off"
              />
              <Submit busy={busy}>
                Create key
                <Icon name="arrow-right" />
              </Submit>
            </form>
          </div>
        </section>
      )}
      <section className="card keys-card">
        <div className="keys-heading">
          <div>
            <h2>
              Your API keys <span className="count-badge">{keys.length}</span>
            </h2>
            <p>A separate key for every connection.</p>
          </div>
          <span className="tile-icon tone-blue">
            <Icon name="key" />
          </span>
        </div>
        {loading ? (
          <div className="empty-state">
            <span className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading API keys</span>
            </span>
          </div>
        ) : keys.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="plug" />
            </span>
            <h3>
              {error
                ? 'Let’s try that again.'
                : 'Room for your first connection.'}
            </h3>
            <p>
              {error
                ? 'Your API keys couldn’t be loaded.'
                : 'Create an API key when you’re ready to connect your own tools.'}
            </p>
            <button
              className="btn btn-outline-primary"
              onClick={() => (error ? setRetry(retry + 1) : setCreating(true))}
            >
              {error ? 'Try again' : 'Create your first key'}
              <Icon name="arrow-right" />
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last used</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td>
                      {editing === key.id ? (
                        <form
                          className="d-flex gap-2"
                          onSubmit={(event) => rename(event, key)}
                        >
                          <label
                            className="visually-hidden"
                            htmlFor={`rename-${key.id}`}
                          >
                            Key name
                          </label>
                          <input
                            className="form-control form-control-sm"
                            name="name"
                            id={`rename-${key.id}`}
                            defaultValue={key.name}
                            maxLength={50}
                            required
                          />
                          <Submit busy={busy}>Save</Submit>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={() => setEditing(null)}
                            aria-label="Cancel rename"
                          >
                            <Icon name="x" />
                          </button>
                        </form>
                      ) : (
                        <div className="key-name">
                          <Icon name="key" />
                          <strong>{key.name}</strong>
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${key.is_active ? '' : 'status-inactive'}`}
                      >
                        <span />
                        {key.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td>{date(key.created_at)}</td>
                    <td>{date(key.last_used_at)}</td>
                    <td>
                      <div className="key-actions">
                        <button
                          className="btn icon-button"
                          aria-label={`Rename ${key.name}`}
                          title="Rename key"
                          disabled={busy}
                          onClick={() => setEditing(key.id)}
                        >
                          <Icon name="pencil" />
                        </button>
                        <button
                          className="btn icon-button"
                          aria-label={`${key.is_active ? 'Pause' : 'Activate'} ${key.name}`}
                          title={key.is_active ? 'Pause key' : 'Activate key'}
                          disabled={busy}
                          onClick={() =>
                            perform(
                              async () => {
                                const updated = await api(
                                  `/users/keys/${key.id}`,
                                  {
                                    method: 'PATCH',
                                    body: { is_active: !key.is_active },
                                  },
                                )
                                setKeys((current) =>
                                  current.map((item) =>
                                    item.id === key.id ? updated : item,
                                  ),
                                )
                              },
                              key.is_active ? 'Key paused.' : 'Key activated.',
                            )
                          }
                        >
                          <Icon
                            name={
                              key.is_active ? 'pause-circle' : 'play-circle'
                            }
                          />
                        </button>
                        <button
                          className="btn icon-button delete-button"
                          aria-label={`Delete ${key.name}`}
                          title="Delete key"
                          disabled={busy}
                          onClick={() => setDeleting(key)}
                        >
                          <Icon name="trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {deleting && (
        <section className="delete-confirmation mt-3" role="alert">
          <div>
            <strong>Delete “{deleting.name}”?</strong>
            <p>
              Any tools using this key will lose access. This can’t be undone.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-light"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={busy}
              onClick={() =>
                perform(async () => {
                  await api(`/users/keys/${deleting.id}`, { method: 'DELETE' })
                  setKeys((current) =>
                    current.filter((key) => key.id !== deleting.id),
                  )
                  setDeleting(null)
                }, 'API key deleted.')
              }
            >
              Delete key
            </button>
          </div>
        </section>
      )}
      <p className="key-footnote">
        <Icon name="shield-lock" />
        Treat API keys like passwords. Keep them private and pause any you’re
        not using.
      </p>
    </>
  )
}
