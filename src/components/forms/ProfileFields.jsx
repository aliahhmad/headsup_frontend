import Field from '../ui/Field'

export default function ProfileFields({
  user,
  register = false,
  admin = false,
}) {
  return (
    <>
      <div className="row gx-3">
        <Field
          id="first_name"
          label="First name"
          defaultValue={user?.first_name}
          placeholder={register ? 'Alex' : undefined}
          autoComplete={admin ? undefined : 'given-name'}
          maxLength={30}
          className={register ? 'col-6' : 'col-sm-6'}
        />
        <Field
          id="last_name"
          label="Last name"
          defaultValue={user?.last_name}
          placeholder={register ? 'Morgan' : undefined}
          autoComplete={admin ? undefined : 'family-name'}
          maxLength={50}
          className={register ? 'col-6' : 'col-sm-6'}
        />
      </div>
      <Field
        id="email"
        label="Email address"
        type="email"
        defaultValue={user?.email}
        placeholder={register ? 'you@example.com' : undefined}
        autoComplete={admin ? undefined : 'email'}
        maxLength={admin ? 120 : undefined}
      />
    </>
  )
}
