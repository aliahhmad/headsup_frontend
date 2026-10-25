import Icon from '../ui/Icon'

export default function CreatedKeyPanel({ rawKey, onCopy, onDismiss }) {
  return (
    <section className="new-key-panel" aria-label="New API key">
      <div className="d-flex gap-3">
        <Icon name="key" />
        <div>
          <h2>Your new key is ready.</h2>
          <p>Copy it somewhere safe. You won’t be able to see it again.</p>
        </div>
      </div>
      <div className="key-copy-row">
        <code>{rawKey}</code>
        <button className="btn btn-outline-primary btn-sm" onClick={onCopy}>
          <Icon name="copy" />
          Copy
        </button>
      </div>
      <button className="btn btn-link p-0 mt-3" onClick={onDismiss}>
        I’ve saved my key
        <Icon name="check2" />
      </button>
    </section>
  )
}
