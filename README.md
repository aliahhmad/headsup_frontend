# HeadsUp web

React and Vite frontend for HeadsUp's monitoring workspace, account settings,
notifications, and administrator tools. Styling uses Bootstrap 5, Bootstrap Icons,
and the shared HeadsUp palette in `src/index.css`.

## Local development

Start the backend using the [API quick start](../api/docs/quick-start.md). From
this frontend directory:

```sh
npm ci
npm run dev
```

Open <http://localhost:5173>. With no `VITE_API_URL`, browser requests use `/api/`;
Vite forwards them to `http://127.0.0.1:8000` and removes the `/api` prefix.
To change the local backend target, copy `.env.example` to `.env.local`, set
`API_PROXY_TARGET`, and restart Vite:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:8005
```

For a separately hosted API, set its full origin instead:

```dotenv
VITE_API_URL=https://api.example.com
```

The supported server deployment exposes API routes at the hostname root, with
no `/api` suffix. Never put SMTP credentials, model keys, database passwords, or
private invitation codes in `VITE_*`: those values are bundled into public assets.

## Screens and behavior

| Route | Purpose |
| --- | --- |
| `/` | Public product introduction and synthetic interactive examples |
| `/login`, `/register` | Authentication and invitation-aware signup |
| `/forgot-password`, `/reset-password` | Account recovery |
| `/overview` | Signed-in workspace overview |
| `/monitors` | Owned monitor directory, status filters, and pagination |
| `/monitors/new` | Create a monitor and queue its initial check |
| `/monitors/{id}` | Configuration, pause/activate, Check now, evidence, and Updates history |
| `/notifications` | Typed inbox with read/unread state; opened through the bell |
| `/profile` | Profile editing and alert-email opt-in |
| `/security` | Password and API-key settings |
| `/admin/users` | Administrator account management |
| `/admin/signup` | Administrator invitation-policy controls |
| `/admin/queue` | Automatic processing switch, single-step control, liveness, and attempts |
| `/admin/runs`, `/admin/runs/{id}` | Cross-account run directory and detailed inspection |

New registrations need email verification; CLI-created accounts are verified.
The API client manages access-token refresh, and sign-out clears the browser
session. The notification inbox is deliberately absent from the sidebar; the bell
provides access. Updates retain their history, including legacy dismissed rows;
open an update to expand its content and sources. There is no frontend dismiss action.

Monitor creation and Check now use the real API. The API-hosted managed worker
processes queued work under administrator controls; a separate CLI worker is optional.
Automatic processing defaults to off for new databases, and a saved enabled mode
resumes after API restart. Model access is required for live processing, and a
successful check does not necessarily produce an alert.

Monitor intervals are persisted but recurring enqueueing is not implemented.
The conversation area accepts an unsaved local draft with Send disabled; chat
processing is deferred. Public homepage examples are synthetic local interactions
and do not perform research. See the [backend feature guides](../api/docs/index.md)
for the complete behavior and boundaries.

## Structure

- `src/App.jsx` connects navigation, session state, and screens.
- `src/pages/` owns page requests and state.
- `src/components/ui/` and `src/components/layout/` provide shared controls and shells.
- Feature components live under `src/components/monitors/`, `admin/`, `auth/`,
  `notifications/`, and related directories.
- `src/lib/api.js` handles API calls and authentication; `src/lib/routes.js`
  describes navigation; `src/lib/navigation.js` handles browser navigation.
- `src/hooks/useServiceStatus.js` checks heartbeat reachability for the service banner.
- `public/favicon.svg` contains the bell mark.

The service banner checks `/heartbeat` on account/authentication routes, including
when focus or connectivity returns. The public homepage does not poll the API.
Heartbeat checks do not establish SMTP delivery or research progress.

## Build and host

```sh
npm run build
npm run preview
```

`build` produces `dist/`. `preview` is a local build check, not the production
hosting service. Deploy `dist/` to a static host with an SPA fallback to `index.html`
so direct links to monitor, notification, and admin pages work. The existing
`vercel.json` supplies that fallback when using that host.

Set `VITE_API_URL` in the build environment and rebuild after changing it. The local
Vite development proxy is unavailable on static hosting. Configure the API's
`FRONTEND_URL` and `CORS_ORIGINS` with the exact frontend origin. Backend deployment,
SMTP, migrations, queue settings, and backups are covered in the
[server runbook](../api/docker_support/deploy/server/README.md).
