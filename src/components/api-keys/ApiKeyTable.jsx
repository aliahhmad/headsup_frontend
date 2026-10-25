import { Icon, Submit } from '../UI'
import StatusBadge from '../ui/StatusBadge'

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not used yet'

export default function ApiKeyTable({
  keys,
  editing,
  busy,
  onRename,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Last used</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id}>
              <td>
                {editing === key.id ? (
                  <form
                    className="d-flex gap-2"
                    onSubmit={(event) => onRename(event, key)}
                  >
                    <label
                      className="visually-hidden"
                      htmlFor={`rename-${key.id}`}
                    >
                      Key name
                    </label>
                    <input
                      className="form-control form-control-sm"
                      name="name"
                      id={`rename-${key.id}`}
                      defaultValue={key.name}
                      maxLength={50}
                      required
                    />
                    <Submit busy={busy}>Save</Submit>
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => onEdit(null)}
                      aria-label="Cancel rename"
                    >
                      <Icon name="x" />
                    </button>
                  </form>
                ) : (
                  <div className="key-name">
                    <Icon name="key" />
                    <strong>{key.name}</strong>
                  </div>
                )}
              </td>
              <td>
                <StatusBadge variant={key.is_active ? '' : 'inactive'}>
                  {key.is_active ? 'Active' : 'Paused'}
                </StatusBadge>
              </td>
              <td>{date(key.created_at)}</td>
              <td>{date(key.last_used_at)}</td>
              <td>
                <div className="key-actions">
                  <button
                    className="btn icon-button"
                    aria-label={`Rename ${key.name}`}
                    title="Rename key"
                    disabled={busy}
                    onClick={() => onEdit(key.id)}
                  >
                    <Icon name="pencil" />
                  </button>
                  <button
                    className="btn icon-button"
                    aria-label={`${key.is_active ? 'Pause' : 'Activate'} ${key.name}`}
                    title={key.is_active ? 'Pause key' : 'Activate key'}
                    disabled={busy}
                    onClick={() => onToggle(key)}
                  >
                    <Icon
                      name={key.is_active ? 'pause-circle' : 'play-circle'}
                    />
                  </button>
                  <button
                    className="btn icon-button delete-button"
                    aria-label={`Delete ${key.name}`}
                    title="Delete key"
                    disabled={busy}
                    onClick={() => onDelete(key)}
                  >
                    <Icon name="trash3" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
