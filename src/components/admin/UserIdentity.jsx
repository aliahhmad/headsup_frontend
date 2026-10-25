import Avatar from '../ui/Avatar'

export default function UserIdentity({
  user,
  self = false,
  showId = false,
  className = '',
}) {
  return (
    <div className={`admin-user-identity ${className}`}>
      <Avatar user={user} />
      <div>
        <strong>
          {`${user.first_name} ${user.last_name}`.trim()}{' '}
          {self && <small className="admin-you">You</small>}
        </strong>
        <span>{user.email}</span>
        {showId && <small>ID {user.id}</small>}
      </div>
    </div>
  )
}
