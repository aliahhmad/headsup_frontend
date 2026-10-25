import { useState } from 'react'
import Brand from '../components/ui/Brand'
import Icon from '../components/ui/Icon'
import Link from '../components/ui/Link'
import ExampleWorkspace from '../components/home/ExampleWorkspace'
import { examples } from '../components/home/examples'
import './Home.css'

const questions = [
  {
    question: 'How is this different from searching or asking a chatbot?',
    answer:
      'A search starts with a question right now. HeadsUp is being built around questions that stay relevant: a topic, the context you choose to share, and what was found before. The aim is to help you understand what changed across checks, with a conversation for what comes next.',
  },
  {
    question: 'What is a monitor?',
    answer:
      'A monitor is a topic you want HeadsUp to follow. It combines your objective, relevant context, findings, and a conversation in one place. It could be a university announcement, the tools you build with, or a focused research interest.',
  },
  {
    question: 'Will every new article become an alert?',
    answer:
      'That is not the goal. Several articles can describe the same development. HeadsUp is designed to bring supporting sources together and compare findings with what was already known, so updates focus on meaningful changes. Relevance and source coverage still matter.',
  },
  {
    question: 'How often will HeadsUp check for changes?',
    answer:
      'The planned workflow uses scheduled checks, with a Check now action when you want another look. It is periodic monitoring, rather than a continuous live feed. Available schedules and supported sources will be confirmed as monitoring becomes available.',
  },
  {
    question: 'Can I start monitoring today?',
    answer:
      'HeadsUp is in development. The interactive workspace on this page is a concept preview with fictional examples, not a live monitoring service. Account access is available through Sign in; monitoring availability, supported sources, and pricing have not been announced here.',
  },
]

export default function Home({ signedIn }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTopic, setActiveTopic] = useState('student')

  return (
    <div className="home-page">
      <a className="home-skip-link" href="#home-main">
        Skip to content
      </a>
      <header
        className="home-header"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen) {
            setMenuOpen(false)
            document.querySelector('.home-menu-toggle')?.focus()
          }
        }}
      >
        <div className="home-container home-header-inner">
          <Brand />
          <nav className="home-desktop-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#possibilities">What to follow</a>
            <a href="#questions">Questions</a>
          </nav>
          <div className="home-header-actions">
            <Link
              className="home-sign-in"
              to={signedIn ? '/overview' : '/login'}
            >
              {signedIn ? 'Your workspace' : 'Sign in'}{' '}
              <Icon name="arrow-up-right" />
            </Link>
            <a
              className="home-button home-button-primary home-header-cta"
              href="#how-it-works"
            >
              Meet your lookout <Icon name="arrow-right" />
            </a>
            <button
              className="home-menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              aria-controls="home-mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name={menuOpen ? 'x-lg' : 'list'} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="home-mobile-nav"
            className="home-mobile-nav"
            aria-label="Mobile navigation"
          >
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works <Icon name="arrow-right" />
            </a>
            <a href="#possibilities" onClick={() => setMenuOpen(false)}>
              What to follow <Icon name="arrow-right" />
            </a>
            <a href="#questions" onClick={() => setMenuOpen(false)}>
              Questions <Icon name="arrow-right" />
            </a>
          </nav>
        )}
      </header>

      <main id="home-main" tabIndex={-1}>
        <section
          className="home-hero home-container"
          aria-labelledby="home-title"
        >
          <div className="home-intro">
            <span className="home-intro-mark">
              <Icon name="bell" />
            </span>{' '}
            Introducing HeadsUp <span className="home-intro-divider" /> Your
            personal lookout
          </div>
          <h1 id="home-title">
            Keep up without
            <br />
            <span>keeping tabs.</span>
            <svg
              className="home-hero-spark"
              viewBox="0 0 62 65"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m29 29 4-24M41 35l17-14M44 47l15 4"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </h1>
          <p className="home-hero-description">
            Some questions don’t end with one search.
            <br className="home-desktop-break" /> HeadsUp is being built to
            follow what matters to you
            <br className="home-desktop-break" /> and help you understand what
            changes.
          </p>
          <div className="home-hero-actions">
            <a className="home-button home-button-primary" href="#how-it-works">
              See how it works <Icon name="arrow-right" />
            </a>
            <a className="home-button home-button-text" href="#product-demo">
              <Icon name="play-circle" /> Explore an example
            </a>
          </div>
          <div className="home-hero-note">
            <span /> Thoughtful updates. Room for everything else.
          </div>
        </section>

        <section
          id="product-demo"
          className="home-preview-section"
          aria-label="Interactive HeadsUp concept preview"
        >
          <div className="home-preview-background" aria-hidden="true" />
          <div className="home-container home-preview-container">
            <div className="home-preview-caption">
              <span>
                <span className="home-caption-line" /> A glimpse of what we’re
                building
              </span>
              <span>
                <Icon name="cursor" /> Choose a topic. Take a look around.
              </span>
            </div>
            <ExampleWorkspace
              activeTopic={activeTopic}
              onSelectTopic={setActiveTopic}
            />
            <p className="home-demo-disclaimer">
              <Icon name="info-circle" /> Interactive concept preview. All
              findings, sources, and times are illustrative.
            </p>
          </div>
        </section>

        <section
          className="home-principle-strip home-container"
          aria-label="The idea behind HeadsUp"
        >
          <span>Less repeat searching.</span>
          <Icon name="asterisk" />
          <span>More useful context.</span>
          <Icon name="asterisk" />
          <span>A clearer next step.</span>
        </section>

        <section
          className="home-how home-container home-section"
          id="how-it-works"
          aria-labelledby="home-how-title"
        >
          <div className="home-section-heading">
            <span className="home-eyebrow">
              A TOPIC. A LITTLE CONTEXT. A HEADS-UP.
            </span>
            <h2 id="home-how-title">
              Give your ongoing questions
              <br />a place to live.
            </h2>
            <p>
              Here’s the experience we’re building. You bring the interest.
              <br className="home-desktop-break" /> HeadsUp helps you stay with
              the story.
            </p>
          </div>
          <div className="home-steps">
            <article className="home-step">
              <div className="home-step-heading">
                <span>01</span>
                <Icon name="chat-square-text" />
              </div>
              <h3>Tell us what matters.</h3>
              <p>
                Choose a topic and add the details that make it yours. A monitor
                is simply a topic you want HeadsUp to follow.
              </p>
              <div className="home-step-example">
                <Icon name="chat-quote" />
                <span>
                  “Follow practical training announcements relevant to my summer
                  plans.”
                </span>
              </div>
            </article>
            <article className="home-step">
              <div className="home-step-heading">
                <span>02</span>
                <Icon name="radar" />
              </div>
              <h3>Let the story develop.</h3>
              <p>
                Scheduled checks are designed to build on earlier findings,
                bringing together sources about the same development.
              </p>
              <div className="home-step-example home-step-check">
                <span className="home-check-dot" />
                <span>
                  Previous findings <Icon name="arrow-right" /> What changed
                </span>
              </div>
            </article>
            <article className="home-step">
              <div className="home-step-heading">
                <span>03</span>
                <Icon name="bell" />
              </div>
              <h3>Get the useful part.</h3>
              <p>
                Explore meaningful updates with context and sources. Then ask a
                follow-up in the same conversation.
              </p>
              <div className="home-step-example">
                <Icon name="arrow-return-right" />
                <span>“What does this mean for my plans?”</span>
              </div>
            </article>
          </div>
        </section>

        <section
          className="home-context-section"
          aria-labelledby="home-context-title"
        >
          <div className="home-container home-context-grid">
            <div className="home-context-copy">
              <span className="home-eyebrow">CONTEXT THAT CARRIES FORWARD</span>
              <h2 id="home-context-title">
                The next update
                <br />
                shouldn’t start
                <br />
                <span>from scratch.</span>
              </h2>
              <p>
                Your interests have a history. HeadsUp is designed to keep
                useful findings and the context you choose to share together, so
                each check can build on the last.
              </p>
              <a className="home-inline-link" href="#product-demo">
                See the idea in action <Icon name="arrow-up-right" />
              </a>
            </div>
            <div
              className="home-context-visual"
              aria-label="Illustration of a topic developing across checks"
            >
              <div className="home-context-note">
                <Icon name="pin-angle" />
                <div>
                  <span>THE CONTEXT YOU SHARE</span>
                  <p>“I’m planning a summer internship.”</p>
                </div>
              </div>
              <div className="home-story-line">
                <div className="home-story-item">
                  <span className="home-story-dot">
                    <Icon name="check2" />
                  </span>
                  <div>
                    <span>FIRST CHECK</span>
                    <h3>A starting point.</h3>
                    <p>Relevant findings become your topic’s baseline.</p>
                  </div>
                </div>
                <div className="home-story-item">
                  <span className="home-story-dot">
                    <Icon name="check2" />
                  </span>
                  <div>
                    <span>NEXT CHECK</span>
                    <h3>More coverage. Same development.</h3>
                    <p>Another article doesn’t always mean another alert.</p>
                  </div>
                </div>
                <div className="home-story-item home-story-item-new">
                  <span className="home-story-dot">
                    <Icon name="bell" />
                  </span>
                  <div>
                    <span>SOMETHING CHANGES</span>
                    <h3>A heads-up, with the backstory.</h3>
                    <p>
                      See the new development in the context of what came
                      before.
                    </p>
                  </div>
                </div>
              </div>
              <span className="home-visual-caption">
                Illustrative monitoring journey
              </span>
            </div>
          </div>
        </section>

        <section
          className="home-possibilities home-container home-section"
          id="possibilities"
          aria-labelledby="home-possibilities-title"
        >
          <div className="home-section-heading home-heading-left">
            <div>
              <span className="home-eyebrow">
                YOUR WORLD HAS MORE THAN ONE TOPIC
              </span>
              <h2 id="home-possibilities-title">What’s on your radar?</h2>
            </div>
            <p>
              For the plans, projects, and questions
              <br className="home-desktop-break" /> you keep coming back to.
            </p>
          </div>
          <div className="home-use-cases">
            {examples.map((example, index) => (
              <a
                className={`home-use-case home-use-case-${example.id}`}
                key={example.id}
                href="#product-demo"
                onClick={() => setActiveTopic(example.id)}
              >
                <div className="home-use-case-top">
                  <span className="home-use-case-icon">
                    <Icon name={example.icon} />
                  </span>
                  <Icon name="arrow-up-right" />
                </div>
                <span className="home-use-case-number">
                  0{index + 1} / {example.category}
                </span>
                <h3>{example.name}</h3>
                <p>{example.description}</p>
                <span className="home-use-case-link">
                  Explore the example <Icon name="arrow-right" />
                </span>
              </a>
            ))}
          </div>
          <p className="home-possibilities-note">
            A few possibilities for HeadsUp. Supported topics and sources will
            depend on coverage as the product develops.
          </p>
        </section>

        <section
          className="home-evidence-section home-container"
          aria-labelledby="home-evidence-title"
        >
          <div className="home-evidence-intro">
            <span className="home-eyebrow">CLARITY INCLUDES THE DETAILS</span>
            <h2 id="home-evidence-title">
              A heads-up.
              <br />
              With something behind it.
            </h2>
            <p>An update should give you a place to look closer.</p>
          </div>
          <div className="home-evidence-items">
            <article>
              <span>
                <Icon name="link-45deg" />
              </span>
              <div>
                <h3>Follow it back to the source.</h3>
                <p>
                  See the evidence behind a finding, with supporting sources
                  kept together.
                </p>
              </div>
            </article>
            <article>
              <span>
                <Icon name="clock-history" />
              </span>
              <div>
                <h3>Know when it was checked.</h3>
                <p>
                  Check times help distinguish an earlier finding from a fresh
                  look.
                </p>
              </div>
            </article>
            <article>
              <span>
                <Icon name="sliders2" />
              </span>
              <div>
                <h3>Keep the direction yours.</h3>
                <p>
                  The planned controls let you refine a topic, pause checks, or
                  ask for another look.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section
          className="home-faq home-container home-section"
          id="questions"
          aria-labelledby="home-faq-title"
        >
          <div className="home-section-heading">
            <span className="home-eyebrow">
              A FEW THINGS YOU MIGHT BE WONDERING
            </span>
            <h2 id="home-faq-title">Good questions.</h2>
          </div>
          <div className="home-faq-list">
            {questions.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <span>
                    <Icon name="plus-lg" />
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="home-final-section home-container"
          aria-labelledby="home-final-title"
        >
          <div className="home-final-orbit" aria-hidden="true">
            <span />
            <span />
            <img src="/favicon.svg" alt="" width="54" height="54" />
          </div>
          <span className="home-eyebrow">
            LESS TIME CHECKING. MORE ROOM FOR LIVING.
          </span>
          <h2 id="home-final-title">
            Let your interests
            <br />
            keep their place.
          </h2>
          <p>
            We’re building HeadsUp for the things that matter
            <br className="home-desktop-break" /> long after you close the tab.
          </p>
          <a className="home-button home-button-primary" href="#product-demo">
            Explore the example <Icon name="arrow-right" />
          </a>
          <span className="home-final-note">
            A work in progress. A little more clarity on the way.
          </span>
        </section>
      </main>

      <footer className="home-footer home-container">
        <div>
          <Brand />
          <p>A little more informed. A little more at ease.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#questions">Questions</a>
          <Link to={signedIn ? '/overview' : '/login'}>
            {signedIn ? 'Your workspace' : 'Sign in'}{' '}
            <Icon name="arrow-up-right" />
          </Link>
        </nav>
        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} HeadsUp</span>
          <span>Made for your attention. Mindful of your time.</span>
          <a href="#home-main">
            Back to top <Icon name="arrow-up" />
          </a>
        </div>
      </footer>
    </div>
  )
}
