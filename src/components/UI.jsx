import { useState } from 'react'

export function navigate(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function Link({ to, children, ...props }) {
  return (
    <a
      href={to}
      {...props}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}

export function Icon({ name, className = '' }) {
  return <i className={`bi bi-${name} ${className}`} aria-hidden="true" />
}

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="HeadsUp home">
      <img src="/favicon.svg" width="35" height="35" alt="" />
      <span>
        heads<span className="brand-up">up</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  )
}

export function Notice({ children, type = 'danger' }) {
  return children ? (
    <div
      className={`alert alert-${type} d-flex gap-2 align-items-start`}
      role={type === 'danger' ? 'alert' : 'status'}
    >
      <Icon name={type === 'danger' ? 'exclamation-circle' : 'check-circle'} />
      <span>{children}</span>
    </div>
  ) : null
}

export function Submit({ busy, children, className = '' }) {
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

export function PasswordField({
  id = 'password',
  label = 'Password',
  hint,
  autoComplete = 'current-password',
  ...props
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="mb-4">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="password-field">
        <input
          className="form-control"
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
        >
          <Icon name={visible ? 'eye-slash' : 'eye'} />
        </button>
      </div>
      {hint && (
        <div id={`${id}-hint`} className="form-text">
          {hint}
        </div>
      )}
    </div>
  )
}

export function Field({ id, label, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input className="form-control" id={id} name={id} required {...props} />
    </div>
  )
}

export function PageHeading({ eyebrow, title, children, action }) {
  return (
    <div className="page-heading d-flex justify-content-between align-items-start gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="text-secondary mb-0">{children}</p>
      </div>
      {action}
    </div>
  )
}
