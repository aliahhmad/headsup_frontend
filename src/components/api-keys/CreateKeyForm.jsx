import { Field, Icon, Submit } from '../UI'

export default function CreateKeyForm({ busy, onSubmit }) {
  return (
    <section className="card settings-card mb-4">
      <div className="settings-card-body">
        <h2 className="h5 mb-4">Create a new API key</h2>
        <form onSubmit={onSubmit}>
          <Field
            id="name"
            label="Key name"
            placeholder="e.g. My personal app"
            maxLength={50}
            autoComplete="off"
          />
          <Submit busy={busy}>
            Create key
            <Icon name="arrow-right" />
          </Submit>
        </form>
      </div>
    </section>
  )
}
