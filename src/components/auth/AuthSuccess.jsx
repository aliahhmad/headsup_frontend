import { Icon, Link } from '../UI'

export default function AuthSuccess({ mode, success, onReset }) {
  return (
    <div className="success-state">
      <div className="form-symbol success-symbol">
        <Icon name="check2" />
      </div>
      <p className="eyebrow">LOOKING GOOD</p>
      <h2>{success.title}</h2>
      <p className="form-subtitle">{success.text}</p>
      {mode === 'register' && (
        <p className="form-bottom">
          <Link to="/verify">Have a verification code?</Link>
        </p>
      )}
      <Link to="/login" className="btn btn-primary w-100">
        Back to sign in
        <Icon name="arrow-right" />
      </Link>
      {['register', 'forgot'].includes(mode) && (
        <button className="btn btn-link mt-3" onClick={onReset}>
          Use a different email
        </button>
      )}
    </div>
  )
}
