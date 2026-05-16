# SESSION_CONTEXT.md

**Last Updated:** 2026-05-16

---

## Session 002 — 2026-05-16 — Infrastructure Stabilization

### What Happened

Post-Phase 1 infrastructure deployment and stabilization. The user independently completed the Vercel and Supabase setup and worked through deployment issues before entering this stabilization documentation session.

### Deployment Problems Encountered and Resolved

#### Problem 1 — Deployment Root Mismatch
**Symptom:** Vercel deployment was failing or serving incorrect content.
**Root Cause:** The initial `vercel.json` was placed at the project root (`/vercel.json`) and referenced `frontend/` as the build directory (`cd frontend && npm run build`). Vercel's deployment root was ambiguous — it was treating the repo root as the project root, creating path resolution confusion.
**Fix:** Set Vercel's "Root Directory" project setting to `frontend/`. Created `frontend/vercel.json` with framework-relative paths. The `vercel.json` inside the root directory tells Vercel how to build relative to that root, not relative to the repo root.
**Lesson:** Vercel's `vercel.json` must live inside the Root Directory configured in Vercel settings. If Root Directory = `frontend/`, then `vercel.json` must be at `frontend/vercel.json`, and all paths within it are relative to `frontend/`.

#### Problem 2 — frontend/frontend Nested Root
**Symptom:** Build commands were running from the wrong working directory, causing nested path issues (e.g., Vite looking for files at `frontend/frontend/src/`).
**Root Cause:** A `cd frontend &&` prefix in the root-level `vercel.json` build command was redundant — Vercel was already running commands from within the `frontend/` root directory as configured.
**Fix:** Removed `cd frontend &&` prefix. The final `frontend/vercel.json` uses `"buildCommand": "npm run build"` with no path prefix — Vercel already executes from the correct directory.
**Lesson:** When the Root Directory is configured in Vercel settings, all commands in `vercel.json` run relative to that directory. Never add `cd <rootdir> &&` to build commands when the root directory is already set.

#### Problem 3 — SPA Routing 404 in Production
**Symptom:** Direct URL navigation (e.g., refreshing or bookmarking a React Router route) returned a 404 in production.
**Root Cause:** Vercel was serving static files and returned 404 for any path that didn't map to a physical file. React Router handles routing client-side, so all paths must serve `index.html`.
**Fix:** Added catch-all rewrite rule to `frontend/vercel.json`:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```
**Lesson:** All SPAs deployed to static hosts (Vercel, Netlify, Cloudflare Pages) require a catch-all rewrite to `index.html`. This is mandatory for client-side routing to function in production.

#### Problem 4 — Root Directory Persistence in Vercel Settings
**Symptom:** Changing `vercel.json` content didn't change deployment behavior.
**Root Cause:** The Root Directory setting in Vercel's project settings overrides `vercel.json` location. This setting persists between deployments and must be set correctly once in the Vercel dashboard.
**Fix:** Confirmed Root Directory = `frontend/` in Vercel project settings. This setting takes precedence over any `vercel.json` at the repo root.
**Lesson:** Vercel's Root Directory project setting (in dashboard) is authoritative. It persists across all future deployments. If it's wrong, `vercel.json` changes at the repo root will have no effect.

#### Problem 5 — Vite Environment Variable Build-Time Injection
**Symptom:** Environment variables configured in Vercel dashboard were not available in the production app.
**Root Cause:** Vite only exposes variables prefixed with `VITE_` to the client bundle. These are injected at **build time**, not at runtime. Variables must exist in the build environment, not just the server runtime environment.
**Fix:** Ensured all client-visible variables use the `VITE_` prefix (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and are added to Vercel's Environment Variables before triggering a new deployment.
**Lesson:** In Vite apps, `VITE_*` variables are compiled into the static bundle during `npm run build`. They are NOT dynamically read at runtime. Any change to these variables requires a full rebuild and redeployment to take effect. Non-`VITE_` variables are server-side only (available in Vercel Functions but not in the browser bundle).

#### Problem 6 — Local vs Cloud Environment Separation
**Root Cause / Learning:** `.env.local` is read by Vite during local development only. Vercel reads its own environment variable store during cloud builds. The two environments are completely separate — no automatic sync.
**Operational Pattern Established:**
- `.env.local` → local development only (in `.gitignore`, never committed)
- `.env.example` → committed template (shows variable names, no values)
- Vercel Dashboard → cloud environment variables (set manually per environment: Preview, Production)
**Lesson:** Always maintain parity between `.env.local` and Vercel's environment variable dashboard. Divergence causes "works locally, broken in production" bugs.

### Infrastructure State After Session 002

- GitHub remote connected: `https://github.com/Gampunk/MarketPulse.git`
- Git branches: `main` (production baseline) + `develop` (active development)
- Vercel project: linked, deploying from `frontend/` root directory
- Production deployment: working ✅
- Preview deployments: auto-trigger on branch push ✅
- Supabase: project created, credentials in `.env.local` + Vercel dashboard
- `frontend/vercel.json`: correct config (`framework: vite`, SPA rewrite)

### Architectural Correction (Session 002)

**Backend API deferred:** The `/api/health.ts` Vercel Function at the project root is NOT currently deployed. Reason: Vercel's root directory is `frontend/`, which means only files inside `frontend/` are included in the deployment. The `/api/` folder at the project root is outside the Vercel deployment scope.

**Implication:** Backend API integration requires one of:
1. Moving `/api/` inside `frontend/api/` (supported by Vercel when root = `frontend/`)
2. OR changing Vercel root back to project root and re-configuring frontend build (more complex)

Option 1 is the lower-risk path and maintains the current stable deployment. Deferred to Phase 3 (when OHLCV caching endpoint is actually needed).

### What To Do Next Session

Begin Phase 2 implementation:
1. Merge `develop` → `main` (infrastructure stabilization is stable)
2. Create `feature/live-price-engine` from `develop`
3. Implement `BinanceCryptoSource` in `frontend/src/api/market/binance.ts`
4. Wire live prices into `PricesStore`
5. Update `Sidebar` to display live prices

---

## Session 001 — 2026-05-16 — Phase 0 + Phase 1

### Summary
Full project initialization from scratch. Phase 0 (environment readiness + architecture stabilization) and Phase 1 (project foundation scaffold) both completed in a single session.

### Environment Verified
- Node.js v24.15.0, npm 11.12.1, Git 2.53.0, VS Code 22.22.1, Python 3.13.13
- npm is the package manager for this project

### Architecture Approved (Session 001)
- Frontend: React 19 + Vite + TypeScript → Vercel
- Charts: TradingView Lightweight Charts v5
- State: TanStack Query v5 + Zustand v5
- Styling: Tailwind CSS v4 + shadcn/ui
- Backend: Vercel Functions (serverless Node.js)
- Database: Supabase PostgreSQL
- Live data: Browser → Binance WebSocket (direct)
- Metadata: CoinGecko API (free tier)
- Deployment: Vercel (frontend + functions co-deployed)

### Key Scope Decisions
- Crypto-first MVP; forex in product Phase 2
- No user authentication — localStorage for watchlists
- Tick-by-tick live prices (<1s) via direct Binance WebSocket
- Candlestick + Line charts required
- Free tier only (Vercel + Supabase)
- Desktop-first MVP

### Phase 1 Deliverables
- Git initialized, React + Vite scaffold, Tailwind v4, path alias `@/`
- Complete src/ folder architecture + types + stores + layout components
- MarketDataSource interface defined (critical abstraction for Phase 2 forex)
- React Router v7 + TanStack Query v5 wired
- `/api/health.ts` + root `vercel.json` + `.env.example` created
- Build: clean (0 errors, 715ms) | Dev server: 473ms cold start
