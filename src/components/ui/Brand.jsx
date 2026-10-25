import Link from './Link'

export default function Brand() {
  return (
    <Link to="/" className="brand" aria-label="HeadsUp home">
      <img src="/favicon.svg" width="35" height="35" alt="" />
      <span>
        heads<span className="brand-up">up</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  )
}
