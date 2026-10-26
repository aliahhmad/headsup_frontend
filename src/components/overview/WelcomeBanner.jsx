import Icon from '../ui/Icon'
import Link from '../ui/Link'

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
          Give the topics you care about a place to live. Create a monitor, set
          its direction, and keep everything together.
        </p>
        <Link to="/monitors" className="btn btn-primary mt-2">
          Explore your monitors <Icon name="arrow-right" />
        </Link>
        <span className="coming-soon-label mt-2">
          <Icon name="stars" /> Automatic checks and messaging are on the way
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
