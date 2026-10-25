import ApiKeyTable from '../components/api-keys/ApiKeyTable'
import CreatedKeyPanel from '../components/api-keys/CreatedKeyPanel'
import CreateKeyForm from '../components/api-keys/CreateKeyForm'
import ConfirmationPanel from '../components/ui/ConfirmationPanel'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Icon, Notice, PageHeading } from '../components/UI'

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
  function toggle(key) {
    perform(
      async () => {
        const updated = await api(`/users/keys/${key.id}`, {
          method: 'PATCH',
          body: { is_active: !key.is_active },
        })
        setKeys((current) =>
          current.map((item) => (item.id === key.id ? updated : item)),
        )
      },
      key.is_active ? 'Key paused.' : 'Key activated.',
    )
  }

  function remove() {
    perform(async () => {
      await api(`/users/keys/${deleting.id}`, { method: 'DELETE' })
      setKeys((current) => current.filter((key) => key.id !== deleting.id))
      setDeleting(null)
    }, 'API key deleted.')
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
        <CreatedKeyPanel
          rawKey={rawKey}
          onCopy={() =>
            perform(
              () => navigator.clipboard.writeText(rawKey),
              'API key copied.',
            )
          }
          onDismiss={() => {
            setRawKey('')
            setMessage('')
          }}
        />
      )}
      {creating && <CreateKeyForm busy={busy} onSubmit={create} />}
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
          <LoadingState label="Loading API keys" />
        ) : keys.length === 0 ? (
          <EmptyState
            icon="plug"
            title={
              error
                ? 'Let’s try that again.'
                : 'Room for your first connection.'
            }
            action={
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  error ? setRetry((value) => value + 1) : setCreating(true)
                }
              >
                {error ? 'Try again' : 'Create your first key'}
                <Icon name="arrow-right" />
              </button>
            }
          >
            {error
              ? 'Your API keys couldn’t be loaded.'
              : 'Create an API key when you’re ready to connect your own tools.'}
          </EmptyState>
        ) : (
          <ApiKeyTable
            keys={keys}
            editing={editing}
            busy={busy}
            onRename={rename}
            onEdit={setEditing}
            onToggle={toggle}
            onDelete={setDeleting}
          />
        )}
      </section>
      {deleting && (
        <ConfirmationPanel
          title={`Delete “${deleting.name}”?`}
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
          confirmLabel="Delete key"
        >
          Any tools using this key will lose access. This can’t be undone.
        </ConfirmationPanel>
      )}
      <p className="key-footnote">
        <Icon name="shield-lock" />
        Treat API keys like passwords. Keep them private and pause any you’re
        not using.
      </p>
    </>
  )
}
