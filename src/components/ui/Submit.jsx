export default function Submit({ busy, children, className = '' }) {
  return (
    <button
      className={`btn btn-primary ${className}`}
      type="submit"
      disabled={busy}
    >
      {busy ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
          Please wait…
        </>
      ) : (
        children
      )}
    </button>
  )
}
