export default function ConfirmationPanel({
  title,
  children,
  busy,
  onCancel,
  onConfirm,
  confirmLabel,
}) {
  return (
    <section className="delete-confirmation mt-3" role="alert">
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-light" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-danger" disabled={busy} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </section>
  )
}
