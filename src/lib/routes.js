export const authRoutes = {
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgot',
  '/reset-password': 'reset',
  '/verify': 'verify',
}
export const navigation = [
  { path: '/overview', label: 'Overview', icon: 'grid-1x2' },
  { path: '/monitors', label: 'Monitors', icon: 'binoculars' },
  { path: '/profile', label: 'My profile', icon: 'person' },
  { path: '/security', label: 'Security', icon: 'shield-check' },
  { path: '/api-keys', label: 'API keys', icon: 'key' },
  { path: '/admin/users', label: 'Manage users', icon: 'people', admin: true },
  {
    path: '/admin/signup',
    label: 'Signup settings',
    icon: 'person-lock',
    admin: true,
  },
]
