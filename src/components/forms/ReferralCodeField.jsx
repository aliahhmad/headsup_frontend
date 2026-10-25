import Field from '../ui/Field'

export default function ReferralCodeField() {
  return (
    <Field
      id="referral_code"
      label="Referral code"
      placeholder="Enter your invitation code"
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      maxLength={128}
      hint="This demo is invite-only. Use the code shared with you."
    />
  )
}
