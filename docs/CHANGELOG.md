# CHANGELOG.md

**Last Updated:** 2026-05-16

---

## [0.2.0] — 2026-05-16 — Infrastructure Stabilization

### Added
- GitHub repository connected (`github.com/Gampunk/MarketPulse`)
- `develop` branch established (active development branch)
- `frontend/vercel.json` — correct Vercel deployment config (framework: vite, root-relative paths)
- Supabase project created and credentials integrated
- `.env.local` configured with Supabase credentials (local development)
- Vercel environment variables configured (Supabase URL + anon key for production)
- `frontend/.gitignore` — frontend-specific ignores

### Fixed
- **Deployment root mismatch:** Original `vercel.json` was at project root but Vercel needed frontend-relative config. Moved to `frontend/vercel.json` with Vercel Root Directory setting `frontend/`
- **SPA routing in production:** Added catch-all rewrite rule (`/(.*) → /index.html`) to support React Router client-side routing in Vercel deployment
- **Environment variable pipeline:** Confirmed `VITE_` prefix required for Vite build-time variable injection — all Supabase keys now correctly prefixed

### Validated
- Production deployment: ✅ Serving correctly from Vercel
- Preview deployment: ✅ Auto-triggered on branch push
- SPA routing: ✅ React Router works in production (no 404 on direct URL access)
- Environment variables: ✅ Supabase credentials available in both local and Vercel environments

---

## [0.1.0] — 2026-05-16 — Phase 1: Project Foundation

### Added
- Git repository initialized (`main` branch, `.gitignore`)
- React 19 + Vite 8 + TypeScript scaffold in `/frontend`
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Path alias `@/` → `src/` (vite.config.ts + tsconfig.app.json)
- Dark trading dashboard theme in `src/index.css` (custom CSS variables)
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `components.json` — shadcn/ui configuration
- `src/types/market.ts` — TypeScript types: TickData, Candle, MarketSymbol, PriceChange, WatchlistItem, MarketDataSource interface
- `src/stores/watchlist.ts` — Zustand v5 store with localStorage persistence
- `src/stores/prices.ts` — Zustand v5 store for live price data
- `src/components/layout/AppLayout.tsx` — main layout shell
- `src/components/layout/TopBar.tsx` — header with live status indicator
- `src/components/layout/Sidebar.tsx` — watchlist sidebar with symbol navigation
- `src/pages/DashboardPage.tsx` — dashboard with active symbol display and stat card placeholders
- `src/App.tsx` — React Router v7 + TanStack Query v5 QueryClient
- `/api/health.ts` — Vercel Function health check endpoint (not yet deployed)
- `vercel.json` — initial Vercel build configuration (superseded by `frontend/vercel.json`)
- `.env.example` — environment variable template
- `tsconfig.json` — root TypeScript config for Vercel Functions

### Validated
- `npm run build` — passes TypeScript check + Vite production build (715ms, 0 errors)
- Dev server starts at `localhost:5173` in 473ms

---

## [0.0.1] — 2026-05-16 — Phase 0: Project Initialization

### Added
- Project governance structure (`/system/`)
- `CLAUDE.md` operational instructions
- Phase 0A: Environment readiness verification
- Phase 0B: Technical discovery and architecture stabilization
- All `/docs/` operational documents initialized
- Core stack selected and approved (see `DECISIONS.md`)
