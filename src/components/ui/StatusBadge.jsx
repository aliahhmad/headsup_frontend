import Icon from './Icon'

export default function StatusBadge({ children, variant = '', icon }) {
  return (
    <span className={`status-badge${variant ? ` status-${variant}` : ''}`}>
      {icon ? <Icon name={icon} /> : <span />}
      {children}
    </span>
  )
}
