import { useState } from 'react'
import Icon from '../ui/Icon'

export default function MonitorChat() {
  const [draft, setDraft] = useState('')

  return (
    <section
      className="card monitor-chat"
      aria-labelledby="monitor-chat-heading"
    >
      <header className="monitor-panel-heading">
        <div className="monitor-panel-title">
          <span className="tile-icon tone-blue">
            <Icon name="chat-left-text" />
          </span>
          <div>
            <h2 id="monitor-chat-heading">Conversation</h2>
            <p>A place to stay with the story.</p>
          </div>
        </div>
        <span className="monitor-coming-soon">Coming soon</span>
      </header>
      <div className="monitor-chat-empty">
        <div className="monitor-chat-art" aria-hidden="true">
          <span />
          <span />
          <img src="/favicon.svg" width="42" height="42" alt="" />
        </div>
        <h3>Every topic has a next question.</h3>
        <p>
          Your monitor’s conversation will live here. Messaging isn’t available
          yet, but you can try the composer below.
        </p>
      </div>
      <form
        className="monitor-chat-form"
        aria-label="Message draft"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="monitor-message" className="form-label">
          Your message
        </label>
        <div className="monitor-composer">
          <textarea
            id="monitor-message"
            name="message"
            rows={3}
            maxLength={10000}
            placeholder="Ask a question about this monitor…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-describedby="monitor-message-help"
          />
          <div className="monitor-composer-footer">
            <span>
              <Icon name="pencil" /> Draft only
            </span>
            <button
              className="btn btn-primary btn-sm"
              type="submit"
              disabled
              aria-label="Send message (coming soon)"
            >
              Send <Icon name="arrow-up" />
            </button>
          </div>
        </div>
        <p id="monitor-message-help">
          <Icon name="info-circle" /> Messages can’t be sent yet. Drafts aren’t
          saved.
        </p>
      </form>
    </section>
  )
}
