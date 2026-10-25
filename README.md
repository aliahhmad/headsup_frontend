# HeadsUp web

React and Vite frontend for HeadsUp’s existing account features, styled with Bootstrap 5 and Bootstrap Icons. The navy, electric blue, teal, off-white, and amber palette is defined with shared CSS variables in `src/index.css`. The simple bell logo and favicon live in `public/favicon.svg`; the illustrations use CSS and the same mark.

## Development

From this directory:

```bash
npm install
npm run dev
```

Run the FastAPI backend using the instructions in `../api/README.md`. By default, Vite forwards requests under `/api/` to `http://127.0.0.1:8000`, so no additional CORS configuration is needed during development.

To use another backend port, copy `.env.example` to `.env.local`, set `API_PROXY_TARGET`, and restart Vite. For example:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:8005
```

## Frontend structure

- `src/pages/` composes each screen and owns its requests and page state.
- `src/components/ui/` contains shared controls and presentation: fields, buttons,
  notices, avatars, status badges, cards, pagination, and loading/empty states.
  `src/components/UI.jsx` keeps the existing shared UI imports available.
- `src/components/layout/` contains the workspace shell, sidebar, navigation,
  topbar, and shared footer. `AuthLayout.jsx` composes the authentication shell.
- `src/components/forms/` contains profile and new-password fields shared by
  registration, settings, and user management.
- `src/components/auth/`, `api-keys/`, `admin/`, and `overview/` contain components
  specific to those features. Tables and forms receive data and callbacks so
  they can be composed without duplicating markup or request logic.
- `src/hooks/useServiceStatus.js` owns heartbeat polling, retries, and cleanup;
  `ServiceStatusBanner.jsx` renders the result and reserves the banner's space.
- `src/lib/` contains the API client, browser navigation, and route definitions.

Use shared components for new screens, and keep API calls with the owning page
or feature. For example, an empty list can render the same state with its own
copy and action:

```jsx
import EmptyState from './components/ui/EmptyState'

<EmptyState
  icon="plug"
  title="No connections yet."
  action={<button className="btn btn-primary" onClick={onCreate}>Add connection</button>}
>
  Connect a tool to get started.
</EmptyState>
```

## Included flows

- Registration and email verification (new accounts must verify before signing in).
- Sign-in, optional persistent sessions, automatic token refresh, and sign-out.
- Password recovery and reset, with matching-password and UTF-8 length validation.
- Personal overview, name/email editing, and password changes.
- API key creation, one-time key display/copy, rename, pause/activate, and confirmed deletion.
- Admin-only user directory at `/admin/users`, with server-side search and pagination,
  profile/password editing, admin promotion, ban/unban, and confirmed deletion.
- Responsive navigation, labeled form fields, keyboard focus indicators, loading/error states, and reduced-motion support.
- A global service-outage banner on every route, including authentication pages.

The outage banner checks the public `/heartbeat` endpoint on startup and about
every 15 seconds, with a five-second timeout. It also checks when the browser
comes online, the window receives focus, or the tab becomes visible. It appears
only after a failed request, a non-success HTTP response, or a response other
than `{"status":"ok"}`, and disappears when the heartbeat recovers. **Check
again** retries immediately. Checks use the configured API base URL, bypass the
cache, and do not attach credentials or change the sign-in session.

The overview clearly marks personal monitoring as upcoming: the backend does not implement monitors, updates, or conversation yet.

Admins see **Manage users** under **Administration** in the sidebar. The backend
supplies the current account's role through `/users/me` and enforces admin access
on user-management endpoints. Regular users cannot open the directory. The page
prevents banning or deleting your own account, and the API prevents deletion of
the last admin. Email verification status is shown for each account. Editing a
user leaves their password unchanged unless you enter a new one. The existing
backend admin panel remains available.

## Referral-only demo signup

The signup form reads the backend's registration settings before allowing
submission. When referral-only signup is on, it requires a referral code and
checks it in a separate request before creating an account. Invalid codes keep
the visitor on the form, and failures to load signup settings show a retry
button. When the setting is false, the field is hidden and signup works normally.

Admins can open **Administration → Signup settings** at `/admin/signup`, toggle
**Require a referral code to sign up**, and save. The badge shows the saved
policy; the switch previews a change until it is saved. Failed saves leave the
existing policy in effect. The setting persists across backend restarts and
applies to all visitors. Regular users cannot access this screen or its API.

The form refreshes the policy when its tab receives focus and before submission.
If codes become required while a visitor is filling out the form, their account
details are preserved and they are prompted to enter a code.

Configure the private `REFERRAL_CODE` on the **backend**. The environment flag
`REFERRAL_CODE_ENABLED` is the initial default until an admin saves an override.
There is no frontend flag, and the code must never be put in a `VITE_*` variable.
See the [backend setup](../api/README.md#referral-only-demo-signup). Apply its
database migration and deploy its endpoints before deploying this frontend.

## Email links

The existing backend verification email points to the API’s `/verify?code=…` route. Following that link verifies the account; then return to the frontend to sign in. The frontend also supports `/verify?code=…`, or pasting the code at `/verify` using “Have a verification code?” on the registration confirmation.

For reset emails to open the frontend, set `FRONTEND_URL=http://localhost:5173` in `api/.env` (use Vite’s actual URL/port), then restart the backend. Its reset route redirects to the frontend’s `/reset-password?code=…`. `BASE_URL` in `api/.env` must also match the running API address. Local emails are available in Mailpit at `http://localhost:8025`.

## Production

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` directory with SPA fallback to `index.html`. In production, reverse proxy `/api/` to FastAPI with that prefix removed, or set `VITE_API_URL` to the public API base URL **before building** and allow the frontend origin in the backend’s `CORS_ORIGINS`. The development proxy does not run in the production build or Vite preview.

For Vercel, `vercel.json` rewrites application routes to `/index.html` so opening
or refreshing `/login`, `/profile`, and password-reset links works. Set the
framework preset to Vite, the build command to `npm run build`, and the output
directory to `dist`. Redeploy after adding or changing the routing configuration.

Fonts load from Google Fonts, with local sans-serif fallbacks. Bootstrap, icons, and the logo are bundled locally.

## Verification

Run `npm run lint` and `npm run build` after changes.

The implementation was checked with a production build, desktop/mobile Chrome checks, and real account flows against the local HeadsUp API and Mailpit: registration, verification, sign-in, profile updates, password change/recovery, token refresh, and API key management.
