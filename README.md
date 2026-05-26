# VeltaCore ITSM — Incident Platform

Multi-tenant incident command, AI RCA, CMDB graph, runbook automation, and infrastructure observability — built for high-pressure operations.

## Stack

- **Vite 6** + **React 18** + **TypeScript** (strict mode, pragmatic)
- **react-router-dom v6** — URL-driven routing with browser history
- **ESLint** + **Prettier** + **Playwright**
- **Multi-stage Docker build** → **nginx-unprivileged:1.27-alpine** with SPA fallback + security headers
- **GitHub Actions CI** — lint, typecheck, build, Playwright, Docker

## Local development

```bash
npm install
npm run dev          # http://127.0.0.1:5174
```

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR on port 5174              |
| `npm run build`   | `tsc --noEmit && vite build` → emits `dist/`       |
| `npm run preview` | Serves built `dist/` on port 4173                  |
| `npm test`        | Playwright smoke spec against the preview server   |
| `npm run lint`    | ESLint over `src/` + `tests/`                      |
| `npm run typecheck` | `tsc --noEmit`                                   |
| `npm run format`  | Prettier-format the repo                           |

## Project layout

```
src/
  main.tsx              # ReactDOM root + BrowserRouter
  App.tsx               # TenantProvider + AppRoutes
  routes.tsx            # URL → screen mapping (45+ routes)

  types/                # Org, Tenant, User, Incident, Site, Device, Tweaks, ...
  data/                 # Typed mock data, one file per domain
  lib/                  # useAuth, useTweaks, spark generator
  components/           # Avatar, KPI, Pill, Sparkline, Gauge, AreaChart, ...
  shell/                # Sidebar, Header, TenantSwitcher, AuthGate, Layout
  tweaks/               # Runtime theme/UX editor (Ctrl+,)
  screens/
    auth/               # Landing, Signin, Signup (3-step wizard)
    dashboard/          # Operations dashboard
    Placeholder.tsx     # Stub for routes pending body migration

Dockerfile              # multi-stage: node:20-alpine → nginx-unprivileged:1.27
nginx.conf              # SPA fallback, CSP, gzip, /healthz, cache rules
.github/workflows/ci.yml
playwright.config.ts
```

## Container

```bash
docker build -t veltacore-itsm .
docker run --rm -p 8080:8080 veltacore-itsm
# → http://127.0.0.1:8080 (with /healthz endpoint)
```

The image runs as the unprivileged `nginx` user. Health check is wired to `/healthz`.

## Routing

URL-driven. Auth state lives in `localStorage.veltacore.auth.v1`; tenant selection in `veltacore.tenant.v1`; tweaks in `veltacore.tweaks.v1`. Protected routes go through `<AuthGate>` which redirects unauthenticated users to `/`.

Highlights:

| Path                       | Screen                       |
| -------------------------- | ---------------------------- |
| `/`                        | Landing (unauthed)           |
| `/login`, `/signup`        | SSO + 3-step wizard          |
| `/dashboard`               | Operations dashboard         |
| `/incidents/:id`           | Incident detail              |
| `/infra/device/:id`        | Device detail                |
| `/integrations/:name`      | Integration detail           |
| `/admin/{tenants,billing,usage}` | Super-admin               |

## Keyboard shortcuts

- **Ctrl/Cmd + K** — open the tenant switcher
- **Ctrl/Cmd + ,** — toggle the tweaks panel (accent, density, dark mode, ...)
- **Esc** — close modal overlays

## CI

`.github/workflows/ci.yml` runs on push and PR to `main`:

1. `npm ci` (cached)
2. `npm run typecheck`
3. `npm run lint`
4. `npm run format:check`
5. `npm run build`
6. `npx playwright install --with-deps chromium`
7. `npm test`
8. Docker image build (push step pre-staged behind comments — uncomment to publish to GHCR)

Build artifacts (`dist/`) and the Playwright HTML report upload on success/failure.

## Migration status

The architectural rewrite is complete (Vite + TS + router + Docker + CI). Most screens render through `<Placeholder>` until their content is ported from the legacy `screens/*.jsx` (which lived at the project root before cutover). Each remaining migration is a mechanical swap against the typed data layer in `src/data/`.

| Phase | Status                                                                  |
| ----- | ----------------------------------------------------------------------- |
| 1     | ✅ Vite + TypeScript foundation                                         |
| 2     | ✅ Type system + data layer                                             |
| 3     | ✅ Primitives + shell + tweaks panel                                    |
| 4     | ✅ Routing + auth + Landing/Signin/Signup                               |
| 5     | ✅ Dashboard fully migrated · other ITSM screens via Placeholder        |
| 6     | ⏸ Infra screens — Placeholder                                          |
| 7     | ⏸ Admin screens — Placeholder                                          |
| 8     | ⏸ Styles split — legacy `styles.css` imported as-is for now             |
| 9     | ✅ Docker + nginx + CI                                                  |
| 10    | ✅ Playwright smoke spec migrated to TS + URL routing                   |
| 11    | ✅ Cutover — legacy root `.jsx`, scripts, screens, uploads all removed  |

## Contact

Maintainer: Rajkumar Madhu · `devops@finspot.in`
