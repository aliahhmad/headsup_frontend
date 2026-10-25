import { useState } from 'react'
import { api, saveSession, validatePassword } from '../lib/api'
import AuthLayout from '../components/AuthLayout'
import {
  Field,
  Icon,
  Link,
  navigate,
  Notice,
  PasswordField,
  Submit,
} from '../components/UI'

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

export default function Auth({ mode = 'login' }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const page = content[mode]
  const code = new URLSearchParams(window.location.search).get('code') || ''
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    for (const field of ['email', 'first_name', 'last_name']) {
      if (fields[field]) fields[field] = fields[field].trim()
    }
    try {
      if (mode === 'login') {
        const tokens = await api('/login/', {
          method: 'POST',
          body: { email: fields.email, password: fields.password },
          auth: false,
        })
        saveSession(tokens, fields.remember === 'on')
        navigate('/overview')
      } else if (mode === 'register') {
        validatePassword(fields.password)
        await api('/register/', { method: 'POST', body: fields, auth: false })
        setSuccess({
          title: 'Check your inbox.',
          text: `We sent a verification link to ${fields.email}. Open it to verify your account, then come back to sign in. The link expires in 10 minutes.`,
        })
      } else if (mode === 'forgot') {
        await api('/forgot-password/', {
          method: 'POST',
          body: { email: fields.email },
          auth: false,
        })
        setSuccess({
          title: 'Check your inbox.',
          text: `If an account exists for ${fields.email}, you’ll receive a password reset link. Check your spam folder, too. The link expires in 30 minutes.`,
        })
      } else if (mode === 'reset') {
        validatePassword(fields.password)
        if (fields.password !== fields.confirm_password)
          throw new Error('Your passwords don’t match. Please try again.')
        await api('/reset-password/', {
          method: 'POST',
          body: { code, new_password: fields.password },
          auth: false,
        })
        saveSession(null)
        setSuccess({
          title: 'You’re all set.',
          text: 'Your password has been updated. Sign in with your new password to continue.',
        })
      } else {
        await api(
          `/verify/?code=${encodeURIComponent(code || fields.code.trim())}`,
          { auth: false },
        )
        setSuccess({
          title: 'Email verified.',
          text: 'A small step, all done. Your account is ready and you can now sign in.',
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthLayout register={mode === 'register'}>
      <div className="auth-form">
        {success ? (
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
              <button
                className="btn btn-link mt-3"
                onClick={() => setSuccess(null)}
              >
                Use a different email
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="form-symbol">
              <Icon name={page.icon} />
            </div>
            <p className="eyebrow">{page.eyebrow}</p>
            <h2>{page.title}</h2>
            <p className="form-subtitle">{page.subtitle}</p>
            <Notice>{error}</Notice>
            <form onSubmit={submit}>
              {mode === 'register' && (
                <div className="row gx-3">
                  <Field
                    id="first_name"
                    label="First name"
                    placeholder="Alex"
                    autoComplete="given-name"
                    maxLength={30}
                    className="col-6"
                  />
                  <Field
                    id="last_name"
                    label="Last name"
                    placeholder="Morgan"
                    autoComplete="family-name"
                    maxLength={50}
                    className="col-6"
                  />
                </div>
              )}
              {['login', 'register', 'forgot'].includes(mode) && (
                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              )}
              {['login', 'register', 'reset'].includes(mode) && (
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
                <PasswordField
                  id="confirm_password"
                  label="Confirm new password"
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  minLength={8}
                />
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
                <Submit busy={busy} className="w-100">
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
        )}
      </div>
    </AuthLayout>
  )
}
