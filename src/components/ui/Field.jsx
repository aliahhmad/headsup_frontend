export default function Field({ id, label, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input className="form-control" id={id} name={id} required {...props} />
    </div>
  )
}
