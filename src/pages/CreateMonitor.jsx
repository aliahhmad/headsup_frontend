import { useEffect, useRef, useState } from 'react'
import {
  Field,
  Icon,
  Link,
  Notice,
  PageHeading,
  Submit,
} from '../components/UI'
import { createMonitor, formatCheckInterval } from '../lib/monitors'
import { navigate } from '../lib/navigation'
import './Monitors.css'

const units = { minutes: 60, hours: 3600, days: 86400 }

export default function CreateMonitor() {
  const [interval, setInterval] = useState('86400')
  const [customCount, setCustomCount] = useState('1')
  const [customUnit, setCustomUnit] = useState('hours')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const mounted = useRef(true)
  const seconds =
    interval === 'custom'
      ? Number(customCount) * units[customUnit]
      : Number(interval)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const data = new FormData(form)
    const name = data.get('name').trim()
    const objective = data.get('objective').trim()
    if (!name || !objective) {
      setError(
        'Give your monitor a name and a clear objective. Spaces alone don’t count.',
      )
      form.elements.namedItem(!name ? 'name' : 'objective').focus()
      return
    }
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 31536000) {
      setError(
        'Choose a whole-number interval between one minute and 365 days.',
      )
      return
    }
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      const created = await createMonitor({
        name,
        objective,
        check_interval_seconds: seconds,
      })
      if (mounted.current) navigate(`/monitors/${created.id}`)
    } catch (err) {
      if (mounted.current) setError(err.message)
    } finally {
      submitting.current = false
      if (mounted.current) setBusy(false)
    }
  }

  return (
    <div className="monitors-page">
      <Link to="/monitors" className="monitor-back-link">
        <Icon name="arrow-left" /> All monitors
      </Link>
      <PageHeading
        eyebrow="MAKE ROOM FOR AN ONGOING QUESTION"
        title="What’s on your radar?"
      >
        Start with a topic. Tell HeadsUp what you want to follow.
      </PageHeading>
      <div className="monitor-create-layout">
        <section
          className="card monitor-create-card"
          aria-labelledby="create-monitor-heading"
        >
          <header className="monitor-panel-heading">
            <div className="monitor-panel-title">
              <span className="tile-icon tone-blue">
                <Icon name="plus-lg" />
              </span>
              <div>
                <h2 id="create-monitor-heading">Create a monitor</h2>
                <p>A few details to give your topic a direction.</p>
              </div>
            </div>
          </header>
          <form
            onSubmit={submit}
            className="monitor-create-form"
            aria-label="Create a monitor"
          >
            <Notice>{error}</Notice>
            <fieldset disabled={busy}>
              <Field
                id="monitor-name"
                name="name"
                label="Monitor name"
                placeholder="e.g. Summer internship openings"
                maxLength={120}
                autoComplete="off"
                hint="A short name you’ll recognize in your list."
              />
              <div className="mb-4">
                <label htmlFor="monitor-objective" className="form-label">
                  What would you like to follow?
                </label>
                <textarea
                  className="form-control monitor-objective-input"
                  id="monitor-objective"
                  name="objective"
                  placeholder="e.g. Follow summer 2027 backend internships in New York. Focus on new openings and application deadlines."
                  rows={5}
                  required
                  maxLength={10000}
                  aria-describedby="monitor-objective-help"
                />
                <p id="monitor-objective-help" className="form-text">
                  Be specific about the topic, scope, and changes that would
                  matter to you.
                </p>
              </div>
              <label htmlFor="monitor-interval" className="form-label">
                Check interval
              </label>
              <select
                id="monitor-interval"
                name="interval"
                className="form-select monitor-interval-select"
                value={interval}
                onChange={(event) => setInterval(event.target.value)}
                aria-describedby="monitor-schedule-help"
              >
                <option value="3600">Every hour</option>
                <option value="21600">Every 6 hours</option>
                <option value="43200">Every 12 hours</option>
                <option value="86400">Every day</option>
                <option value="604800">Every week</option>
                <option value="custom">Custom interval</option>
              </select>
              {interval === 'custom' && (
                <div className="monitor-custom-interval">
                  <div>
                    <label
                      htmlFor="monitor-custom-count"
                      className="form-label"
                    >
                      Repeat every
                    </label>
                    <input
                      type="number"
                      id="monitor-custom-count"
                      className="form-control"
                      min="1"
                      max={Math.floor(31536000 / units[customUnit])}
                      step="1"
                      value={customCount}
                      onChange={(event) => setCustomCount(event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="monitor-custom-unit" className="form-label">
                      Unit
                    </label>
                    <select
                      id="monitor-custom-unit"
                      className="form-select"
                      value={customUnit}
                      onChange={(event) => setCustomUnit(event.target.value)}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              )}
              <p
                id="monitor-schedule-help"
                className="form-text monitor-schedule-help"
              >
                <Icon name="info-circle" /> Active monitors queue checks at this
                interval. Processing starts when an administrator runs the queue.
              </p>
            </fieldset>
            <div className="monitor-form-actions">
              <Submit busy={busy} busyLabel="Creating monitor…">
                Create monitor <Icon name="arrow-right" />
              </Submit>
              <Link to="/monitors" className="btn btn-link">
                Cancel
              </Link>
            </div>
          </form>
        </section>
        <aside className="monitor-create-aside">
          <div className="monitor-create-note">
            <span className="monitor-create-note-icon">
              <Icon name="binoculars" />
            </span>
            <span className="eyebrow">A LITTLE DIRECTION GOES A LONG WAY</span>
            <h2>
              A topic.
              <br />A purpose.
              <br />
              <span>A place to return to.</span>
            </h2>
            <p>
              Think of a monitor as an ongoing question. A clear objective helps
              keep that question focused.
            </p>
            <div className="monitor-create-example">
              <span>AN EXAMPLE OBJECTIVE</span>
              <p>
                “Follow official announcements about the scholarships I’m
                interested in. Focus on opening dates and requirement changes.”
              </p>
            </div>
          </div>
          <div className="monitor-create-summary">
            <Icon name="clock" />
            <div>
              <strong>
                {Number.isInteger(seconds) && seconds > 0 && seconds <= 31536000
                  ? formatCheckInterval(seconds)
                  : 'Choose an interval'}
              </strong>
              <p>Your saved check preference.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
