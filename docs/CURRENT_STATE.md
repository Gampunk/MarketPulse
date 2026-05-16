# CURRENT_STATE.md

**Last Updated:** 2026-05-16
**Current Phase:** Phase 2 — Live Price Engine (next)
**System State:** BUILDING

---

## Active Focus

Phase 1 (Project Foundation) is complete. The scaffold is built, builds clean, and dev server runs. Transitioning to Phase 2 — Binance WebSocket integration and live price engine.

---

## What Is Working

- Git repository initialized (main branch, .gitignore configured)
- React 19 + Vite + TypeScript — builds clean (715ms, 0 TS errors)
- Tailwind CSS v4 — integrated via @tailwindcss/vite plugin
- Path alias `@/` → `src/` — working in TypeScript + Vite
- shadcn/ui — components.json configured, `cn()` utility ready
- React Router v7 — wired in App.tsx
- TanStack Query v5 — QueryClient configured in App.tsx
- Zustand v5 — watchlist + prices stores created
- AppLayout, TopBar, Sidebar — rendered with dark trading theme
- DashboardPage — placeholder layout with symbol stat cards
- MarketDataSource interface — typed and defined in src/types/market.ts
- WatchlistStore — persisted via localStorage (zustand/persist)
- PricesStore — ready for WebSocket data ingestion
- Vercel Functions — /api/health.ts scaffold created
- vercel.json — build config for Vercel deployment
- .env.example — environment variable template
- Dev server: `http://localhost:5173` — starts in 473ms

---

## What Is Not Yet Built

- Binance WebSocket connection manager
- Live price data flowing into PricesStore
- Real-time price display in Sidebar watchlist items
- Coin search + add-to-watchlist flow
- TradingView Lightweight Charts integration
- OHLCV data pipeline (Binance REST → Vercel Function → Supabase cache)
- Supabase project (not yet created by user)
- GitHub remote (not yet connected by user)
- Vercel project (not yet deployed by user)

---

## Environment Status

| Tool            | Status  | Version  |
|-----------------|---------|----------|
| Node.js         | READY   | v24.15.0 |
| npm             | READY   | 11.12.1  |
| Git             | READY   | 2.53.0   |
| VS Code         | READY   | 22.22.1  |
| React + Vite    | READY   | 19 + 8   |
| Tailwind CSS    | READY   | v4       |
| Vercel CLI      | PENDING | user action needed |
| Supabase        | PENDING | user action needed |

---

## Active Branch

`main` (Git initialized, first commit pending)

---

## Next Action

Phase 2: Implement Binance WebSocket connection manager, wire live prices into PricesStore and Sidebar watchlist display.

**User actions needed before Vercel/Supabase:**
1. Create GitHub repo and push (optional but recommended before Phase 2)
2. Create Supabase project — save URL + anon key to `.env.local`
3. Install Vercel CLI: `npm i -g vercel` then `vercel link`
