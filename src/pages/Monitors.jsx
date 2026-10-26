import { useEffect, useState } from 'react'
import { Icon, Link, Notice, PageHeading } from '../components/UI'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Pagination from '../components/ui/Pagination'
import MonitorStatus from '../components/monitors/MonitorStatus'
import {
  formatCheckInterval,
  formatMonitorDate,
  listMonitors,
} from '../lib/monitors'
import './Monitors.css'

const PAGE_SIZE = 9
const filters = [
  { value: '', label: 'All monitors' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
]

export default function Monitors() {
  const [view, setView] = useState({ status: '', page: 1 })
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState(null)
  const requestKey = JSON.stringify([view.status, view.page, retry])
  const loading = result?.key !== requestKey
  const data = loading ? null : result?.data
  const error = loading ? '' : result?.error

  useEffect(() => {
    let active = true
    listMonitors({ status: view.status, page: view.page, size: PAGE_SIZE })
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
  }, [view.status, view.page, requestKey])

  return (
    <div className="monitors-page">
      <PageHeading
        eyebrow="YOUR PERSONAL LOOKOUT"
        title="Your monitors"
        action={
          <Link to="/monitors/new" className="btn btn-primary">
            <Icon name="plus-lg" /> Create a monitor
          </Link>
        }
      >
        A home for the topics you keep coming back to.
      </PageHeading>
      <div className="monitor-stage-note">
        <span className="monitor-stage-icon">
          <Icon name="binoculars" />
        </span>
        <div>
          <strong>Start with what matters to you.</strong>
          <p>
            Save your topics and their schedules. Automatic checks and messaging
            are coming next.
          </p>
        </div>
      </div>
      <section aria-labelledby="monitor-list-heading" aria-busy={loading}>
        <div className="monitor-list-toolbar">
          <h2 id="monitor-list-heading">
            Your topics{' '}
            {data && <span className="count-badge">{data.total}</span>}
          </h2>
          <button
            className="btn monitor-refresh"
            onClick={() => setRetry((value) => value + 1)}
            disabled={loading}
          >
            <Icon name="arrow-clockwise" /> Refresh
          </button>
        </div>
        <div
          className="monitor-filters"
          role="group"
          aria-label="Filter monitors by status"
        >
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={view.status === filter.value ? 'is-selected' : ''}
              aria-pressed={view.status === filter.value}
              onClick={() => setView({ status: filter.value, page: 1 })}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          {loading ? (
            <div className="card monitor-list-state">
              <LoadingState label="Loading monitors" tone="primary">
                <p className="mt-3 mb-0">Gathering your topics…</p>
              </LoadingState>
            </div>
          ) : error ? (
            <>
              <Notice>{error}</Notice>
              <div className="card monitor-list-state">
                <EmptyState
                  icon="wifi-off"
                  title="Your monitors couldn’t be loaded."
                  action={
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setRetry((value) => value + 1)}
                    >
                      Try again <Icon name="arrow-clockwise" />
                    </button>
                  }
                >
                  Try refreshing to reconnect with your topics.
                </EmptyState>
              </div>
            </>
          ) : data?.items.length === 0 ? (
            <div className="card monitor-list-state">
              <EmptyState
                icon="binoculars"
                title={
                  view.status
                    ? `No ${view.status} monitors.`
                    : 'What would you like to keep an eye on?'
                }
                action={
                  view.status ? (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setView({ status: '', page: 1 })}
                    >
                      View all monitors <Icon name="arrow-right" />
                    </button>
                  ) : (
                    <Link to="/monitors/new" className="btn btn-primary">
                      Create your first monitor <Icon name="plus-lg" />
                    </Link>
                  )
                }
              >
                {view.status
                  ? 'Try another status to find the topic you’re looking for.'
                  : 'Give an ongoing question a place to live. Start with a topic and what you want to follow.'}
              </EmptyState>
            </div>
          ) : (
            data && (
              <>
                <div className="monitor-grid">
                  {data.items.map((monitor) => (
                    <Link
                      key={monitor.id}
                      to={`/monitors/${monitor.id}`}
                      className="card monitor-topic-card"
                    >
                      <div className="monitor-topic-card-top">
                        <span className="tile-icon tone-blue">
                          <Icon name="binoculars" />
                        </span>
                        <MonitorStatus status={monitor.status} />
                      </div>
                      <h3>{monitor.name}</h3>
                      <p className="monitor-topic-objective">
                        {monitor.objective}
                      </p>
                      <div className="monitor-topic-cadence">
                        <Icon name="clock" />{' '}
                        {formatCheckInterval(monitor.check_interval_seconds)}
                      </div>
                      <div className="monitor-topic-card-footer">
                        <span>
                          View monitor <Icon name="arrow-up-right" />
                        </span>
                        <time
                          dateTime={monitor.created_at}
                          title={`Created ${formatMonitorDate(monitor.created_at)}`}
                        >
                          {new Intl.DateTimeFormat(undefined, {
                            month: 'short',
                            day: 'numeric',
                          }).format(new Date(monitor.created_at))}
                        </time>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination
                  page={view.page}
                  pages={data.pages}
                  total={data.total}
                  pageSize={PAGE_SIZE}
                  label="Monitor list pagination"
                  itemLabel="monitors"
                  filtered={Boolean(view.status)}
                  onPageChange={(page) =>
                    setView((current) => ({ ...current, page }))
                  }
                />
              </>
            )
          )}
        </div>
      </section>
    </div>
  )
}
