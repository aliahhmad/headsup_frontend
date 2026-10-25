import Icon from './Icon'

export default function Pagination({
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  label,
  itemLabel = 'items',
  filtered = false,
}) {
  return (
    <div className="admin-pagination">
      <span>
        {total ? (page - 1) * pageSize + 1 : 0}–
        {Math.min(page * pageSize, total)} of {total} {itemLabel}
        {filtered ? ' found' : ''}
      </span>
      <nav aria-label={label}>
        <button
          className="btn btn-outline-primary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <Icon name="chevron-left" />
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, pages)}
        </span>
        <button
          className="btn btn-outline-primary btn-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <Icon name="chevron-right" />
        </button>
      </nav>
    </div>
  )
}
