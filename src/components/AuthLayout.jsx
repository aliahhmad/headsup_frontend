import { Brand, Icon, Link } from './UI'

export default function AuthLayout({ children, register }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Brand />
        <div className="header-prompt">
          <span>
            {register ? 'Already have an account?' : 'New around here?'}
          </span>
          <Link
            to={register ? '/login' : '/register'}
            className="btn btn-outline-primary btn-sm"
          >
            {register ? 'Sign in' : 'Create an account'}
            <Icon name="arrow-up-right" />
          </Link>
        </div>
      </header>
      <main className="auth-main">
        <section className="auth-story" aria-label="About HeadsUp">
          <div className="story-content">
            <div className="pill">
              <span className="status-dot" /> A little less noise. A lot more
              clarity.
            </div>
            <h1>
              Your world moves fast.
              <br />
              <span>Stay a step ahead.</span>
            </h1>
            <p className="story-description">
              A quieter way to keep up with what matters.
              <br className="d-none d-xl-block" /> Your personal assistant for
              meaningful change.
            </p>
            <div className="signal-scene" aria-hidden="true">
              <div className="radar-orbit orbit-outer" />
              <div className="radar-orbit orbit-middle" />
              <div className="radar-orbit orbit-inner" />
              <div className="radar-line line-one" />
              <div className="radar-line line-two" />
              <div className="radar-center">
                <img src="/favicon.svg" alt="" />
              </div>
              <span className="orbit-dot dot-one" />
              <span className="orbit-dot dot-two" />
              <span className="orbit-dot dot-three" />
              <div className="signal-tag tag-research">
                <span className="tag-icon">
                  <Icon name="journal-text" />
                </span>
                <span>Research & discoveries</span>
              </div>
              <div className="signal-tag tag-policy">
                <span className="tag-icon">
                  <Icon name="globe2" />
                </span>
                <span>Policy & regulations</span>
              </div>
              <div className="signal-tag tag-tech">
                <span className="tag-icon">
                  <Icon name="cpu" />
                </span>
                <span>Technology & ideas</span>
              </div>
              <div className="signal-note">
                <span className="note-icon">
                  <Icon name="stars" />
                </span>
                <div>
                  <strong>The signal, without the noise.</strong>
                  <span>Only the changes worth your attention.</span>
                </div>
                <span className="note-tick">
                  <Icon name="check2" />
                </span>
              </div>
            </div>
            <div className="story-footer">
              <Icon name="bullseye" />
              <span>
                Built around your interests. Mindful of your attention.
              </span>
            </div>
          </div>
        </section>
        <section className="auth-form-section" aria-label="Your account">
          {children}
        </section>
      </main>
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} HeadsUp</span>
        <span>
          A little more informed. A little more at ease.
          <Icon name="asterisk" />
        </span>
      </footer>
    </div>
  )
}
