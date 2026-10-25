import UserDialog from '../components/admin/UserDialog'
import UserTable from '../components/admin/UserTable'
import UserSearch from '../components/admin/UserSearch'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Pagination from '../components/ui/Pagination'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Icon, Notice, PageHeading } from '../components/UI'

const PAGE_SIZE = 20
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
    const params = new URLSearchParams({
      page: String(view.page),
      size: String(PAGE_SIZE),
    })
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
    return () => {
      active = false
    }
  }, [view.query, view.page, requestKey])

  function saved(updated) {
    if (selection.action === 'edit' && selection.user.id === currentUser.id)
      setCurrentUser(updated)
    const messages = {
      edit: 'User details saved.',
      promote: 'Admin access granted.',
      ban: 'User banned.',
      unban: 'User access restored.',
      delete: 'User deleted.',
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
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Manage users"
        action={
          <button
            className="btn btn-outline-primary flex-shrink-0"
            disabled={loading}
            onClick={() => setVersion((value) => value + 1)}
          >
            <Icon name="arrow-clockwise" />
            Refresh
          </button>
        }
      >
        Look after the people in HeadsUp. Manage their details and account
        access.
      </PageHeading>
      <Notice type="success">{message}</Notice>
      <section
        className="card admin-users-card"
        aria-labelledby="users-heading"
      >
        <div className="keys-heading">
          <div>
            <h2 id="users-heading">
              User directory{' '}
              {data && <span className="count-badge">{data.total}</span>}
            </h2>
            <p>Search by name or email to find an account.</p>
          </div>
          <span className="tile-icon tone-blue">
            <Icon name="people" />
          </span>
        </div>
        <UserSearch
          query={view.query}
          onSearch={search}
          onClear={() => {
            setView({ query: '', page: 1 })
            setMessage('')
          }}
        />
        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <LoadingState label="Loading users" tone="primary">
              <p className="mt-3 mb-0">Loading the directory…</p>
            </LoadingState>
          ) : error ? (
            <div className="empty-state">
              <Notice>{error}</Notice>
              <button
                className="btn btn-outline-primary"
                onClick={() => setVersion((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : data?.items.length === 0 ? (
            <EmptyState
              icon="person-search"
              title={view.query ? 'No matching users.' : 'No users yet.'}
            >
              {view.query
                ? `No names or emails matched “${view.query}”. Try a different search.`
                : 'Registered accounts will appear here.'}
            </EmptyState>
          ) : (
            data && (
              <>
                <UserTable
                  users={data.items}
                  currentUserId={currentUser.id}
                  query={view.query}
                  onSelect={setSelection}
                />
                <Pagination
                  page={view.page}
                  pages={data.pages}
                  total={data.total}
                  pageSize={PAGE_SIZE}
                  itemLabel="users"
                  filtered={Boolean(view.query)}
                  label="User directory pagination"
                  onPageChange={(page) => setView({ ...view, page })}
                />
              </>
            )
          )}
        </div>
      </section>
      <p className="key-footnote">
        <Icon name="shield-lock" />
        Your own account is protected from banning and deletion on this page.
      </p>
      {selection && (
        <UserDialog
          selection={selection}
          onClose={() => setSelection(null)}
          onSaved={saved}
        />
      )}
    </>
  )
}
