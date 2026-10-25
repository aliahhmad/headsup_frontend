import { navigate } from '../../lib/navigation'

export default function Link({ to, children, ...props }) {
  return (
    <a
      href={to}
      {...props}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}
