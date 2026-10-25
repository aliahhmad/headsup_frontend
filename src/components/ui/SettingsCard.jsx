import Icon from './Icon'

export default function SettingsCard({ icon, title, description, children }) {
  return (
    <section className="card settings-card">
      <div className="settings-card-heading">
        <span className="tile-icon tone-blue">
          <Icon name={icon} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="settings-card-body">{children}</div>
    </section>
  )
}
