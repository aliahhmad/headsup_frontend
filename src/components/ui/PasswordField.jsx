import { useState } from 'react'
import Icon from './Icon'

export default function PasswordField({
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
