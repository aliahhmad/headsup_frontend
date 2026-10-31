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
  { path: '/notifications', label: 'Notifications', icon: 'bell', section: 'workspace', sidebar: false },
  { path: '/profile', label: 'My profile', icon: 'person', section: 'account' },
  {
    path: '/security',
    label: 'Security',
    icon: 'shield-check',
    section: 'account',
  },
  {
    path: '/admin/users',
    label: 'Manage users',
    icon: 'people',
    section: 'administration',
    group: 'access',
    admin: true,
  },
  {
    path: '/admin/signup',
    label: 'Signup settings',
    icon: 'person-lock',
    section: 'administration',
    group: 'access',
    admin: true,
  },
  {
    path: '/admin/queue', label: 'Queue', icon: 'collection-play',
    section: 'administration', group: 'operations', admin: true,
  },
  {
    path: '/admin/runs', label: 'Monitor runs', icon: 'activity',
    section: 'administration', group: 'operations', admin: true,
  },
]

export const navigationSections = [
  { id: 'workspace', label: 'Workspace', ariaLabel: 'Workspace navigation' },
  { id: 'account', label: 'Account', ariaLabel: 'Account settings' },
  {
    id: 'administration',
    label: 'Administration',
    ariaLabel: 'Administration',
    icon: 'shield-lock',
    description: 'Manage all accounts',
    groups: [
      { id: 'operations', label: 'Operations' },
      { id: 'access', label: 'People & access' },
    ],
  },
]
