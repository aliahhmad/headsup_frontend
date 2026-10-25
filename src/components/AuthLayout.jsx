import AuthStory from './auth/AuthStory'
import Footer from './layout/Footer'
import { Brand, Icon, Link } from './UI'

export default function AuthLayout({ children, register }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Brand />
        <div className="header-prompt">
          <span>
            {register ? 'Already have an account?' : 'New around here?'}
          </span>
          <Link
            to={register ? '/login' : '/register'}
            className="btn btn-outline-primary btn-sm"
          >
            {register ? 'Sign in' : 'Create an account'}
            <Icon name="arrow-up-right" />
          </Link>
        </div>
      </header>
      <main className="auth-main">
        <AuthStory />
        <section className="auth-form-section" aria-label="Your account">
          {children}
        </section>
      </main>
      <Footer className="auth-footer">
        A little more informed. A little more at ease.
      </Footer>
    </div>
  )
}
