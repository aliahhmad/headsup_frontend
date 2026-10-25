import Icon from './Icon'

export default function EmptyState({
  icon,
  title,
  children,
  action,
  heading: Heading = 'h3',
}) {
  return (
    <div className="empty-state">
      {icon && (
        <span className="empty-icon">
          <Icon name={icon} />
        </span>
      )}
      <Heading>{title}</Heading>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
