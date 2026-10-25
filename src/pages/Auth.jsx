import { navigate } from '../lib/navigation'
import { useState } from 'react'
import { api, saveSession, validatePassword } from '../lib/api'
import AuthLayout from '../components/AuthLayout'
import AuthForm from '../components/auth/AuthForm'
import AuthSuccess from '../components/auth/AuthSuccess'
import useRegistrationSettings from '../hooks/useRegistrationSettings'

export default function Auth({ mode = 'login' }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [checkingReferral, setCheckingReferral] = useState(false)
  const registration = useRegistrationSettings(mode === 'register')
  const code = new URLSearchParams(window.location.search).get('code') || ''
  async function submit(event) {
    event.preventDefault()
    if (
      busy ||
      (mode === 'register' && (registration.loading || registration.error))
    )
      return
    setError('')
    setBusy(true)
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    for (const field of ['email', 'first_name', 'last_name', 'referral_code']) {
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
        const required = await registration.refresh()
        if (required) {
          if (!fields.referral_code) {
            throw new Error(
              'A referral code is now required. Enter your invitation code to continue.',
            )
          }
          setCheckingReferral(true)
          const checked = await api('/registration/referral-code/', {
            method: 'POST',
            body: { referral_code: fields.referral_code },
            auth: false,
          })
          if (checked?.valid !== true) {
            throw new Error(
              'The referral code could not be verified. Please try again.',
            )
          }
          setCheckingReferral(false)
        } else {
          delete fields.referral_code
        }
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
      setCheckingReferral(false)
    }
  }
  return (
    <AuthLayout register={mode === 'register'}>
      <div className="auth-form">
        {success ? (
          <AuthSuccess
            mode={mode}
            success={success}
            onReset={() => setSuccess(null)}
          />
        ) : (
          <AuthForm
            mode={mode}
            code={code}
            busy={busy}
            error={error}
            onSubmit={submit}
            registration={registration}
            checkingReferral={checkingReferral}
          />
        )}
      </div>
    </AuthLayout>
  )
}
