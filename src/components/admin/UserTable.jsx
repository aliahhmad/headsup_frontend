import Icon from '../ui/Icon'
import StatusBadge from '../ui/StatusBadge'
import UserIdentity from './UserIdentity'

export default function UserTable({ users, currentUserId, query, onSelect }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0 admin-users-table">
        <caption className="visually-hidden">
          HeadsUp user accounts{query ? ` matching ${query}` : ''}
        </caption>
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Role</th>
            <th scope="col">Verification</th>
            <th scope="col">Access</th>
            <th scope="col" className="text-end">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const self = user.id === currentUserId
            return (
              <tr key={user.id}>
                <td>
                  <UserIdentity user={user} self={self} showId />
                </td>
                <td data-label="Role">
                  <span
                    className={`admin-role ${user.role === 'admin' ? 'admin-role-elevated' : ''}`}
                  >
                    {user.role === 'admin' && <Icon name="shield-check" />}
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td data-label="Verification">
                  <StatusBadge
                    variant={user.verified ? '' : 'inactive'}
                    icon={user.verified ? 'check-circle' : 'clock'}
                  >
                    {user.verified ? 'Verified' : 'Unverified'}
                  </StatusBadge>
                </td>
                <td data-label="Access">
                  <StatusBadge variant={user.banned ? 'banned' : ''}>
                    {user.banned ? 'Banned' : 'Allowed'}
                  </StatusBadge>
                </td>
                <td>
                  <div className="key-actions">
                    <button
                      className="btn icon-button"
                      title="Edit user"
                      aria-label={`Edit ${user.email}`}
                      onClick={() => onSelect({ user, action: 'edit' })}
                    >
                      <Icon name="pencil" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        className="btn icon-button"
                        title="Make admin"
                        aria-label={`Make ${user.email} an admin`}
                        onClick={() => onSelect({ user, action: 'promote' })}
                      >
                        <Icon name="shield-plus" />
                      </button>
                    )}
                    <button
                      className="btn icon-button"
                      disabled={self}
                      title={
                        self
                          ? 'You cannot ban your own account'
                          : user.banned
                            ? 'Unban user'
                            : 'Ban user'
                      }
                      aria-label={`${user.banned ? 'Unban' : 'Ban'} ${user.email}`}
                      onClick={() =>
                        onSelect({
                          user,
                          action: user.banned ? 'unban' : 'ban',
                        })
                      }
                    >
                      <Icon name={user.banned ? 'unlock' : 'slash-circle'} />
                    </button>
                    <button
                      className="btn icon-button delete-button"
                      disabled={self}
                      title={
                        self
                          ? 'You cannot delete your own account here'
                          : 'Delete user'
                      }
                      aria-label={`Delete ${user.email}`}
                      onClick={() => onSelect({ user, action: 'delete' })}
                    >
                      <Icon name="trash3" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
