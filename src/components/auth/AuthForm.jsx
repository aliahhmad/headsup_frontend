import { Field, Icon, Link, Notice, PasswordField, Submit } from '../UI'
import ProfileFields from '../forms/ProfileFields'
import NewPasswordFields from '../forms/NewPasswordFields'
import ReferralCodeField from '../forms/ReferralCodeField'
import LoadingState from '../ui/LoadingState'

const content = {
  login: {
    icon: 'box-arrow-in-right',
    eyebrow: 'YOUR PERSONAL LOOKOUT',
    title: 'Welcome back.',
    subtitle: 'Good to see you. Let’s get you caught up.',
  },
  register: {
    icon: 'person-plus',
    eyebrow: 'MAKE ROOM FOR WHAT MATTERS',
    title: 'A heads-up starts here.',
    subtitle: 'Create your account. Keep your world in view.',
  },
  forgot: {
    icon: 'envelope-open',
    eyebrow: 'LET’S GET YOU BACK IN',
    title: 'Forgot your password?',
    subtitle: 'It happens. We’ll send you a link to reset it.',
  },
  reset: {
    icon: 'shield-lock',
    eyebrow: 'A FRESH START',
    title: 'Set a new password.',
    subtitle: 'Make it something secure and just for you.',
  },
  verify: {
    icon: 'envelope-check',
    eyebrow: 'ONE LAST THING',
    title: 'Verify your email.',
    subtitle: 'Confirm your email to make yourself at home.',
  },
}

export default function AuthForm({
  mode,
  code,
  busy,
  error,
  onSubmit,
  registration,
  checkingReferral,
  emailVerified,
}) {
  const page = content[mode]
  return (
    <>
      <div className="form-symbol">
        <Icon name={page.icon} />
      </div>
      <p className="eyebrow">{page.eyebrow}</p>
      <h2>{page.title}</h2>
      <p className="form-subtitle">
        {mode === 'register' && registration.required
          ? 'This demo is invite-only. Enter your referral code to create an account.'
          : page.subtitle}
      </p>
      <Notice>{error}</Notice>
      {emailVerified && (
        <Notice type="success">
          Your email is verified. Sign in to continue.
        </Notice>
      )}
      {mode === 'register' && registration.loading ? (
        <LoadingState label="Loading signup requirements" />
      ) : mode === 'register' && registration.error ? (
        <>
          <Notice>{registration.error}</Notice>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={registration.retry}
          >
            Try again
          </button>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          {mode === 'register' && <ProfileFields register />}
          {['login', 'forgot'].includes(mode) && (
            <Field
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          )}
          {['login', 'register'].includes(mode) && (
            <PasswordField
              placeholder={
                mode === 'login'
                  ? 'Enter your password'
                  : 'Create a strong password'
              }
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={mode === 'login' ? undefined : 8}
              hint={
                mode !== 'login'
                  ? 'At least 8 characters. Maximum 72 bytes.'
                  : undefined
              }
            />
          )}
          {mode === 'reset' && (
            <NewPasswordFields
              label="Password"
              confirmationPlaceholder="Enter your password again"
            />
          )}
          {mode === 'register' && registration.required && (
            <ReferralCodeField />
          )}
          {mode === 'login' && (
            <div className="d-flex justify-content-between align-items-center login-options">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                  name="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}
          {mode === 'verify' && !code && (
            <Field
              id="code"
              label="Verification code"
              placeholder="Paste the code from your verification link"
              autoComplete="off"
            />
          )}
          {mode === 'reset' && !code ? (
            <Notice>
              This link is missing its reset code.{' '}
              <Link to="/forgot-password">Request a new reset link.</Link>
            </Notice>
          ) : (
            <Submit
              busy={busy}
              busyLabel={
                checkingReferral ? 'Checking referral code…' : 'Please wait…'
              }
              className="w-100"
            >
              {
                {
                  login: 'Sign in',
                  register: 'Create account',
                  forgot: 'Send reset link',
                  reset: 'Update password',
                  verify: 'Verify my email',
                }[mode]
              }
              <Icon name="arrow-right" />
            </Submit>
          )}
        </form>
      )}
      {mode === 'login' ? (
        <>
          <div className="form-divider">
            <span>Your next chapter, a little clearer</span>
          </div>
          <p className="form-bottom">
            Don’t have an account?{' '}
            <Link to="/register">
              Get started
              <Icon name="arrow-up-right" />
            </Link>
          </p>
        </>
      ) : (
        <p className="form-bottom mt-4">
          <Link to="/login">
            <Icon name="arrow-left" /> Back to sign in
          </Link>
        </p>
      )}
      <div className="privacy-note">
        <Icon name="shield-check" />
        <span>A secure space for your personal lookout.</span>
      </div>
    </>
  )
}
