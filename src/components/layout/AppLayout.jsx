import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'

export default function AppLayout({ path, user, title, onSignOut, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        document.querySelector('[aria-label="Open navigation"]')?.focus()
      }
    }
    const closeOnNavigation = () => setMenuOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('popstate', closeOnNavigation)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('popstate', closeOnNavigation)
    }
  }, [menuOpen])

  return (
    <div className="app-shell">
      <Sidebar
        path={path}
        user={user}
        menuOpen={menuOpen}
        onClose={closeMenu}
      />
      {menuOpen && (
        <button
          className="sidebar-backdrop d-lg-none"
          onClick={closeMenu}
          aria-label="Close navigation"
        />
      )}
      <div className="app-content">
        <Topbar
          title={title}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
          onSignOut={onSignOut}
        />
        <main className="workspace-main" id="main-content">
          {children}
        </main>
        <Footer className="workspace-footer">Mindful of your attention.</Footer>
      </div>
    </div>
  )
}
