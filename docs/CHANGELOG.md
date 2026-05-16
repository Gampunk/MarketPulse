# CHANGELOG.md

**Last Updated:** 2026-05-16

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
- `/api/health.ts` — Vercel Function health check endpoint
- `vercel.json` — Vercel build configuration (frontend/dist output)
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
