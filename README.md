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

The implementation was checked with a production build, desktop/mobile Chrome checks, and real account flows against the local HeadsUp API and Mailpit: registration, verification, sign-in, profile updates, password change/recovery, token refresh, and API key management.
