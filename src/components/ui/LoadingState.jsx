export default function LoadingState({
  label,
  children,
  className = 'empty-state',
  tone = 'success',
}) {
  return (
    <div className={className}>
      <span className={`spinner-border text-${tone}`} role="status">
        <span className="visually-hidden">{label}</span>
      </span>
      {children}
    </div>
  )
}
