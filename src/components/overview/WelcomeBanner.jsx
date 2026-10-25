import Icon from '../ui/Icon'

export default function WelcomeBanner() {
  return (
    <section className="welcome-banner">
      <div className="welcome-copy">
        <span className="pill">
          <span className="status-dot" />
          YOU’RE IN GOOD COMPANY
        </span>
        <h2>
          More signal.
          <br />
          <span>Less noise.</span>
        </h2>
        <p>
          HeadsUp is taking shape around a simple idea: keep an eye on what
          matters, and speak up when it changes.
        </p>
        <span className="coming-soon-label">
          <Icon name="stars" /> Personal monitoring is on the way
        </span>
      </div>
      <div className="banner-radar" aria-hidden="true">
        <span />
        <span />
        <span />
        <img src="/favicon.svg" alt="" />
        <i className="radar-spark spark-one" />
        <i className="radar-spark spark-two" />
      </div>
    </section>
  )
}
