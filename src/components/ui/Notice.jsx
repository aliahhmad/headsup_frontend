import Icon from './Icon'

export default function Notice({ children, type = 'danger' }) {
  return children ? (
    <div
      className={`alert alert-${type} d-flex gap-2 align-items-start`}
      role={type === 'danger' ? 'alert' : 'status'}
    >
      <Icon name={type === 'danger' ? 'exclamation-circle' : 'check-circle'} />
      <span>{children}</span>
    </div>
  ) : null
}
