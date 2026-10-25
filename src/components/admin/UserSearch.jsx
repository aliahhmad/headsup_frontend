import Icon from '../ui/Icon'

export default function UserSearch({ query, onSearch, onClear }) {
  return (
    <form
      className="admin-search"
      onSubmit={onSearch}
      role="search"
      aria-label="Search users"
    >
      <div className="admin-search-input">
        <Icon name="search" />
        <label className="visually-hidden" htmlFor="user-search">
          Search by name or email
        </label>
        <input
          className="form-control"
          type="search"
          id="user-search"
          name="search"
          placeholder="Search by name or email…"
          maxLength={100}
        />
      </div>
      <button className="btn btn-primary" type="submit">
        Search
      </button>
      {query && (
        <button className="btn btn-light" type="reset" onClick={onClear}>
          Clear
        </button>
      )}
    </form>
  )
}
