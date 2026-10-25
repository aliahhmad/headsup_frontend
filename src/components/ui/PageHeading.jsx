export default function PageHeading({ eyebrow, title, children, action }) {
  return (
    <div className="page-heading d-flex justify-content-between align-items-start gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="text-secondary mb-0">{children}</p>
      </div>
      {action}
    </div>
  )
}
