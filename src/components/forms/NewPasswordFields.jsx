import PasswordField from '../ui/PasswordField'

export default function NewPasswordFields({
  label = 'New password',
  confirmationPlaceholder = 'Enter your new password again',
}) {
  return (
    <>
      <PasswordField
        label={label}
        autoComplete="new-password"
        placeholder="Create a strong password"
        minLength={8}
        hint="At least 8 characters. Maximum 72 bytes."
      />
      <PasswordField
        id="confirm_password"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder={confirmationPlaceholder}
        minLength={8}
      />
    </>
  )
}
