import ActionCard from '../components/ui/ActionCard'
import WelcomeBanner from '../components/overview/WelcomeBanner'
import { Icon, PageHeading } from '../components/UI'

export default function Overview({ user }) {
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE MORE CLARITY"
        title={`Welcome, ${user.first_name}.`}
      >
        Your interests. Your account. A space that’s yours.
      </PageHeading>
      <WelcomeBanner />
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
            icon: 'binoculars',
            title: 'Follow your interests',
            text: 'Keep your ongoing topics together and give each one a clear objective.',
            link: '/monitors',
            action: 'View your monitors',
            color: 'tone-amber',
          },
        ].map((card) => (
          <div className="col-md-4" key={card.link}>
            <ActionCard
              to={card.link}
              icon={card.icon}
              title={card.title}
              action={card.action}
              tone={card.color}
            >
              {card.text}
            </ActionCard>
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
