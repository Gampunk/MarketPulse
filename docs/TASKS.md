# TASKS.md

**Last Updated:** 2026-05-18
**Current Phase:** Phase 3 — Charting (next)

---

## Active Tasks (Phase 3)

Phase 3 tasks will be defined at the start of the Phase 3 session. See [PHASES.md](PHASES.md) and [ROADMAP.md](ROADMAP.md) for scope.

---

## Completed Tasks

### Phase 2 — Live Price Engine — COMPLETE (2026-05-18)
- [x] P2-001: `BinanceCryptoSource` in `src/api/market/binance.ts` — implements `MarketDataSource`, combined miniTicker stream, exponential backoff reconnection
- [x] P2-002: Sidebar watchlist rows show live price + 24h change % (green/red)
- [x] P2-003: DashboardPage stat cards — Price, Change 24h, Volume 24h, High/Low — live from `PricesStore`
- [x] P2-004: AddSymbolSearch component — fetches USDT pairs from Binance exchangeInfo, inline search with TanStack Query cache (1h stale)
- [x] P2-005: Remove-from-watchlist X button on hover, unsubscribes price stream on removal

### Phase 1.5 — Infrastructure Stabilization — COMPLETE (2026-05-16)
- [x] UA-001: GitHub repository created and connected (`github.com/Gampunk/MarketPulse`) — `main` + `develop` branches established
- [x] UA-002: Supabase project created — URL + anon key configured in `.env.local` and Vercel dashboard
- [x] UA-003: Vercel project linked — production + preview deployments operational; Supabase env vars added to Vercel dashboard

### Phase 1 — Project Foundation — COMPLETE (2026-05-16)
- [x] P1-001: Git repository initialized (`main` branch, `.gitignore`)
- [x] P1-002: React + Vite + TypeScript scaffold in `/frontend`
- [x] P1-003: Tailwind CSS v4 configured via Vite plugin
- [x] P1-004: shadcn/ui configured (`components.json`, `cn()` utility)
- [x] P1-005: Path alias `@/` working in TypeScript + Vite
- [x] P1-006: Core dependencies installed (TanStack Query, Zustand, Lightweight Charts, React Router v7)
- [x] P1-007: TypeScript type system for market data (`src/types/market.ts`)
- [x] P1-008: Zustand stores — watchlist (localStorage) + prices
- [x] P1-009: Base layout — AppLayout, TopBar, Sidebar
- [x] P1-010: DashboardPage placeholder
- [x] P1-011: React Router v7 + TanStack Query QueryClient in App.tsx
- [x] P1-012: Vercel Functions scaffold (`/api/health.ts`)
- [x] P1-013: `vercel.json` build config
- [x] P1-014: `.env.example` environment variable template
- [x] P1-015: `npm run build` passes clean — 0 TypeScript errors, 715ms build
- [x] P1-016: Dev server validated at `localhost:5173`

### Phase 0 — Project Initialization — COMPLETE (2026-05-16)
- [x] Phase 0A: Environment readiness verification
- [x] Phase 0B: Technical discovery + architecture stabilization
