import Icon from '../ui/Icon'

export default function Footer({ className, children }) {
  return (
    <footer className={className}>
      <span>© {new Date().getFullYear()} HeadsUp</span>
      <span>
        {children}
        <Icon name="asterisk" />
      </span>
    </footer>
  )
}
