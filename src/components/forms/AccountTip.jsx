import Icon from '../ui/Icon'

export default function AccountTip({ security }) {
  return (
    <aside className="tip-card">
      <Icon name={security ? 'lightbulb' : 'fingerprint'} />
      <h3>
        {security
          ? 'A stronger kind of password.'
          : 'Your space, your details.'}
      </h3>
      <p>
        {security
          ? 'Use a unique password you don’t use anywhere else. A longer passphrase is easier to remember and harder to guess.'
          : 'Keep your email current. It’s where you’ll receive account verification and password recovery links.'}
      </p>
      <div className="tip-divider" />
      <span>
        <Icon name="shield-check" /> A little care goes a long way.
      </span>
    </aside>
  )
}
