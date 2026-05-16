# TASKS.md

**Last Updated:** 2026-05-16
**Current Phase:** Phase 2 — Live Price Engine

---

## Active Tasks (Phase 2)

### P2-001 — Binance WebSocket Connection Manager
**Priority:** HIGH | **Status:** PENDING
- Create `src/api/market/binance.ts` implementing `MarketDataSource` interface
- Handle combined stream endpoint (multiple symbols, one connection)
- Implement reconnection with exponential backoff
- Emit price data into `usePricesStore`

### P2-002 — Live Price Display in Sidebar
**Priority:** HIGH | **Status:** PENDING
- Subscribe to prices for all watchlist symbols on mount
- Display live price in each watchlist row
- Show 24h change % with green/red color coding
- Update tick-by-tick without full re-render

### P2-003 — Price Stats in Dashboard Header
**Priority:** HIGH | **Status:** PENDING
- Wire up stat cards (Price, Change 24h, Volume, High, Low) for active symbol
- Pull from `usePricesStore`
- Format numbers: price with 2dp, volume with K/M suffix

### P2-004 — Coin Search + Add to Watchlist
**Priority:** MEDIUM | **Status:** PENDING
- Fetch supported USDT pairs from Binance REST `/api/v3/exchangeInfo`
- Searchable dropdown/command palette (Cmd+K)
- Add symbol to watchlist and auto-subscribe price stream

### P2-005 — Remove from Watchlist
**Priority:** MEDIUM | **Status:** PENDING
- Right-click or hover action to remove symbol from watchlist
- Unsubscribe from price stream on removal

---

## Pending User Actions (before or during Phase 2)

### UA-001 — Create GitHub Repository
- Create repo at github.com
- Add remote: `git remote add origin <repo-url>`
- Push: `git push -u origin main`

### UA-002 — Create Supabase Project
- Go to supabase.com and create a free project
- Copy URL + anon key
- Create `.env.local` with these values (see `.env.example`)

### UA-003 — Install Vercel CLI and Link Project
- `npm i -g vercel`
- `vercel login`
- `vercel link` (from project root)
- Add Supabase env vars to Vercel dashboard

---

## Completed Tasks

### Phase 1 — COMPLETE (2026-05-16)
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

### Phase 0 — COMPLETE (2026-05-16)
- [x] Phase 0A: Environment readiness verification
- [x] Phase 0B: Technical discovery + architecture stabilization
