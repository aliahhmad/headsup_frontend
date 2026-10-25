import { api } from './api'

export async function getReferralRequirement() {
  const settings = await api('/registration/settings/', { auth: false })
  if (typeof settings?.referral_code_required !== 'boolean') {
    throw new Error('Signup is temporarily unavailable. Please try again.')
  }
  return settings.referral_code_required
}
