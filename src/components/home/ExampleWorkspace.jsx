import { useState } from 'react'
import Icon from '../ui/Icon'
import { examples } from './examples'

export default function ExampleWorkspace({ activeTopic, onSelectTopic }) {
  const example = examples.find((item) => item.id === activeTopic)
  const [followUp, setFollowUp] = useState(null)

  function selectTopic(id) {
    setFollowUp(null)
    onSelectTopic(id)
  }

  function handleTabKey(event, index) {
    const movement = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    }[event.key]
    let nextIndex
    if (movement)
      nextIndex = (index + movement + examples.length) % examples.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = examples.length - 1
    else return
    event.preventDefault()
    selectTopic(examples[nextIndex].id)
    document.getElementById(`example-tab-${examples[nextIndex].id}`)?.focus()
  }

  return (
    <div className="home-workspace">
      <div className="home-workspace-bar">
        <div className="home-window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span>
          <Icon name="lock" /> Your own little lookout
        </span>
        <span className="home-preview-label">Concept preview</span>
      </div>
      <div className="home-workspace-body">
        <aside className="home-demo-sidebar" aria-label="Example topics">
          <div className="home-demo-wordmark">
            <img src="/favicon.svg" alt="" width="25" height="25" /> HeadsUp
          </div>
          <p className="home-demo-nav-label">
            YOUR TOPICS <span>{examples.length}</span>
          </p>
          <div
            className="home-demo-tabs"
            role="tablist"
            aria-label="Choose an example topic"
          >
            {examples.map((item, index) => (
              <button
                key={item.id}
                id={`example-tab-${item.id}`}
                role="tab"
                type="button"
                aria-selected={activeTopic === item.id}
                aria-controls={`example-panel-${item.id}`}
                tabIndex={activeTopic === item.id ? 0 : -1}
                onClick={() => selectTopic(item.id)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <Icon name={item.icon} />
                <span>{item.name}</span>
                {activeTopic === item.id && (
                  <span className="home-demo-active-dot" />
                )}
              </button>
            ))}
          </div>
          <div className="home-demo-sidebar-note">
            <Icon name="cup-hot" />
            <p>
              A little less checking.
              <br />A little more headspace.
            </p>
          </div>
          <div className="home-demo-person">
            <span>J</span>
            <div>
              Jamie’s workspace<small>Fictional example</small>
            </div>
          </div>
        </aside>
        <section
          key={example.id}
          className="home-demo-content"
          id={`example-panel-${example.id}`}
          role="tabpanel"
          aria-labelledby={`example-tab-${example.id}`}
          tabIndex={0}
        >
          <div className="home-demo-heading">
            <span>
              <Icon name={example.icon} /> {example.name}
            </span>
            <span>
              <Icon name="clock" /> Example check · 9:00 AM
            </span>
          </div>
          <div className="home-demo-context">
            <Icon name="person-check" />
            <span>{example.context}</span>
          </div>
          <article className="home-demo-update">
            <div className="home-demo-update-top">
              <span>
                <Icon name="stars" /> A development to explore
              </span>
              <span>Illustrative update</span>
            </div>
            <h3>{example.headline}</h3>
            <p>{example.summary}</p>
            <div className="home-demo-why">
              <span>
                <Icon name="bullseye" /> WHY IT’S RELEVANT
              </span>
              <p>{example.relevance}</p>
            </div>
            <details className="home-demo-sources">
              <summary>
                <span>
                  <Icon name="link-45deg" /> {example.sources.length} example
                  sources
                </span>
                <span>
                  Inspect sources <Icon name="chevron-down" />
                </span>
              </summary>
              <div className="home-demo-source-list">
                {example.sources.map((source) => (
                  <div key={source.title}>
                    <strong>{source.title}</strong>
                    <span>{source.publisher} · Fictional source</span>
                    <p>{source.excerpt}</p>
                  </div>
                ))}
              </div>
            </details>
          </article>
          <div className="home-demo-follow-up">
            <span className="home-demo-assistant-icon">
              <Icon name="chat-left-text" />
            </span>
            <div>
              <strong>There’s room for your next question.</strong>
              <p>An update can become a conversation.</p>
            </div>
          </div>
          <button
            type="button"
            className="home-demo-question"
            aria-expanded={followUp === example.id}
            aria-controls={`example-answer-${example.id}`}
            onClick={() =>
              setFollowUp(followUp === example.id ? null : example.id)
            }
          >
            <span>{example.question}</span>
            <Icon name={followUp === example.id ? 'dash' : 'arrow-up-right'} />
          </button>
          <div
            id={`example-answer-${example.id}`}
            className="home-demo-answer"
            hidden={followUp !== example.id}
          >
            <span>EXAMPLE FOLLOW-UP</span>
            <p>{example.answer}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
