export default function Submit({
  busy,
  disabled = false,
  busyLabel = 'Please wait…',
  children,
  className = '',
}) {
  return (
    <button
      className={`btn btn-primary ${className}`}
      type="submit"
      disabled={busy || disabled}
    >
      {busy ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  )
}
