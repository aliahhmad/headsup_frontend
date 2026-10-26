export const authRoutes = {
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgot',
  '/reset-password': 'reset',
  '/verify': 'verify',
}
export const navigation = [
  {
    path: '/overview',
    label: 'Overview',
    icon: 'grid-1x2',
    section: 'workspace',
  },
  {
    path: '/monitors',
    label: 'Monitors',
    icon: 'binoculars',
    section: 'workspace',
  },
  { path: '/profile', label: 'My profile', icon: 'person', section: 'account' },
  {
    path: '/security',
    label: 'Security',
    icon: 'shield-check',
    section: 'account',
  },
  { path: '/api-keys', label: 'API keys', icon: 'key', section: 'developer' },
  {
    path: '/admin/users',
    label: 'Manage users',
    icon: 'people',
    section: 'administration',
    admin: true,
  },
  {
    path: '/admin/signup',
    label: 'Signup settings',
    icon: 'person-lock',
    section: 'administration',
    admin: true,
  },
]

export const navigationSections = [
  { id: 'workspace', label: 'Workspace', ariaLabel: 'Workspace navigation' },
  { id: 'account', label: 'Account', ariaLabel: 'Account settings' },
  { id: 'developer', label: 'Developer tools', ariaLabel: 'Developer tools' },
  {
    id: 'administration',
    label: 'Administration',
    ariaLabel: 'Administration',
  },
]
