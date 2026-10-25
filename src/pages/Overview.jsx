import { Icon, Link, PageHeading } from '../components/UI'

export default function Overview({ user }) {
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE MORE CLARITY"
        title={`Welcome, ${user.first_name}.`}
      >
        Your interests. Your account. A space that’s yours.
      </PageHeading>
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
      <div className="section-heading">
        <h2>Make yourself at home</h2>
        <span>A few things you can do right now</span>
      </div>
      <div className="row g-4 setup-cards">
        {[
          {
            icon: 'person',
            title: 'Make it personal',
            text: 'Keep your name and email up to date, so your account feels like you.',
            link: '/profile',
            action: 'Edit your profile',
            color: 'tone-blue',
          },
          {
            icon: 'shield-check',
            title: 'Keep it secure',
            text: 'A little peace of mind starts with a strong, unique password.',
            link: '/security',
            action: 'Manage security',
            color: 'tone-teal',
          },
          {
            icon: 'key',
            title: 'Connect your tools',
            text: 'Create and manage API keys for your own apps and integrations.',
            link: '/api-keys',
            action: 'Manage API keys',
            color: 'tone-amber',
          },
        ].map((card) => (
          <div className="col-md-4" key={card.link}>
            <Link to={card.link} className="card setup-card h-100">
              <span className={`tile-icon ${card.color}`}>
                <Icon name={card.icon} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="card-action">
                {card.action}
                <Icon name="arrow-up-right" />
              </span>
            </Link>
          </div>
        ))}
      </div>
      <div className="attention-note">
        <span className="attention-icon">
          <Icon name="soundwave" />
        </span>
        <div>
          <h3>Your attention is a valuable thing.</h3>
          <p>
            We’re building a calmer way to stay informed. No endless feeds. Just
            meaningful changes.
          </p>
        </div>
        <span className="small-flower" aria-hidden="true">
          ✳
        </span>
      </div>
    </>
  )
}
