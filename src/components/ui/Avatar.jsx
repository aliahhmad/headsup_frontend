export default function Avatar({ user, large = false, fallback = '…' }) {
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
    : fallback

  return (
    <span className={`avatar${large ? ' avatar-lg' : ''}`}>{initials}</span>
  )
}
