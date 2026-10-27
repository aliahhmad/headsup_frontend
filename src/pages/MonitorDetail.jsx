import { useEffect, useState } from 'react'
import { Icon, Link, Notice, PageHeading } from '../components/UI'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import MonitorStatus from '../components/monitors/MonitorStatus'
import MonitorChat from '../components/monitors/MonitorChat'
import MonitorCheck from '../components/monitors/MonitorCheck'
import {
  formatCheckInterval,
  formatMonitorDate,
  getMonitor,
} from '../lib/monitors'
import './Monitors.css'

export default function MonitorDetail({ monitorId }) {
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState(null)
  const requestKey = JSON.stringify([monitorId, retry])
  const loading = result?.key !== requestKey
  const monitor = loading ? null : result?.data
  const error = loading ? '' : result?.error

  useEffect(() => {
    let active = true
    getMonitor(monitorId)
      .then((data) => {
        if (active) setResult({ key: requestKey, data })
      })
      .catch((err) => {
        if (active) setResult({ key: requestKey, error: err.message })
      })
    return () => {
      active = false
    }
  }, [monitorId, requestKey])

  return (
    <div className="monitors-page">
      <Link to="/monitors" className="monitor-back-link">
        <Icon name="arrow-left" /> All monitors
      </Link>
      {loading ? (
        <>
          <PageHeading eyebrow="YOUR MONITOR" title="Opening your topic…">
            Getting the details together.
          </PageHeading>
          <section className="card">
            <LoadingState label="Loading monitor" tone="primary">
              <p className="mt-3 mb-0">Loading monitor details…</p>
            </LoadingState>
          </section>
        </>
      ) : error ? (
        <>
          <PageHeading
            eyebrow="YOUR MONITOR"
            title="This monitor couldn’t be opened."
          >
            It may be unavailable or no longer accessible.
          </PageHeading>
          <Notice>{error}</Notice>
          <section className="card">
            <EmptyState
              icon="binoculars"
              title="Let’s take another look."
              action={
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Try again <Icon name="arrow-clockwise" />
                </button>
              }
            >
              Return to your monitors or try loading this topic again.
            </EmptyState>
          </section>
        </>
      ) : (
        monitor && (
          <>
            <PageHeading
              eyebrow="YOUR MONITOR"
              title={monitor.name}
              action={<MonitorStatus status={monitor.status} />}
            >
              Your topic and its conversation, in one place.
            </PageHeading>
            <div className="monitor-detail-layout">
              <MonitorChat key={monitor.id} />
              <aside
                className="monitor-configuration-column"
                aria-label="Monitor configuration"
              >
                <MonitorCheck
                  key={monitor.id}
                  monitorId={monitor.id}
                  status={monitor.status}
                  initialRun={monitor.latest_run}
                />
                <section
                  className="card monitor-configuration"
                  aria-labelledby="monitor-configuration-heading"
                >
                  <header className="monitor-panel-heading">
                    <div className="monitor-panel-title">
                      <span className="tile-icon tone-teal">
                        <Icon name="sliders2" />
                      </span>
                      <div>
                        <h2 id="monitor-configuration-heading">
                          Monitor details
                        </h2>
                        <p>The direction you’ve set.</p>
                      </div>
                    </div>
                  </header>
                  <div className="monitor-configuration-body">
                    <span className="monitor-detail-label">OBJECTIVE</span>
                    <p className="monitor-detail-objective">
                      {monitor.objective}
                    </p>
                    <dl className="monitor-configuration-list">
                      <div>
                        <dt>
                          <Icon name="clock" /> Check interval
                        </dt>
                        <dd>
                          {formatCheckInterval(monitor.check_interval_seconds)}
                        </dd>
                      </div>
                      <div>
                        <dt>
                          <Icon name="calendar3" /> Next due time
                        </dt>
                        <dd>{formatMonitorDate(monitor.next_run_at)}</dd>
                      </div>
                      <div>
                        <dt>
                          <Icon name="calendar-plus" /> Created
                        </dt>
                        <dd>
                          <time dateTime={monitor.created_at}>
                            {formatMonitorDate(monitor.created_at)}
                          </time>
                        </dd>
                      </div>
                      <div>
                        <dt>
                          <Icon name="pencil-square" /> Last updated
                        </dt>
                        <dd>
                          <time dateTime={monitor.updated_at}>
                            {formatMonitorDate(monitor.updated_at)}
                          </time>
                        </dd>
                      </div>
                    </dl>
                    <p className="monitor-timezone-note">
                      Times are shown in your local timezone.
                    </p>
                  </div>
                </section>
                <div className="monitor-availability-note">
                  <Icon name="hourglass-split" />
                  <div>
                    <strong>Check whenever you need.</strong>
                    <p>
                      Use Check now to request fresh research. Automatic checks
                      and messaging are coming next.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )
      )}
    </div>
  )
}
