# SESSION_CONTEXT.md

**Last Updated:** 2026-05-16

---

## Session 001 — 2026-05-16 — Phase 0 + Phase 1

### Summary
Full project initialization from scratch. Phase 0 (environment readiness + architecture stabilization) and Phase 1 (project foundation scaffold) both completed in a single session.

### Environment Verified
- Node.js v24.15.0, npm 11.12.1, Git 2.53.0, VS Code 22.22.1, Python 3.13.13
- No pnpm/yarn/bun — npm is the package manager for this project

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
- Crypto-first MVP; forex in Phase 2 of product
- No user authentication — localStorage for watchlists
- Tick-by-tick live prices (<1s) via direct Binance WebSocket
- Candlestick + Line charts required
- Free tier only (Vercel + Supabase)
- Desktop-first MVP

### Phase 1 Deliverables (Session 001)
- Git initialized (main branch)
- React + Vite scaffold built and building clean
- Tailwind v4 + path alias `@/` configured
- Complete src/ folder architecture created
- `src/types/market.ts` — MarketDataSource interface + all market types
- `src/stores/watchlist.ts` — persisted to localStorage with default symbols
- `src/stores/prices.ts` — ready for WebSocket ingestion
- AppLayout + TopBar + Sidebar + DashboardPage — functional placeholder UI
- React Router v7 + TanStack Query v5 wired
- `/api/health.ts` Vercel Function created
- `vercel.json` + `.env.example` created
- Build: clean (0 errors, 715ms) | Dev server: 473ms cold start

### Critical Implementation Note (Session 001)
The `MarketDataSource` interface in `src/types/market.ts` is the abstraction layer that will allow forex integration in Phase 2 without architecture changes. All WebSocket + REST data access must go through a class implementing this interface — never hardcode Binance-specific logic into UI components.

### Pending User Actions
1. Create GitHub repo + push (optional but recommended)
2. Create Supabase project (needed for Phase 3 OHLCV caching)
3. Install Vercel CLI + link project (needed for deployment)

### What To Do Next Session
Begin Phase 2: implement `src/api/market/binance.ts` as `BinanceCryptoSource implements MarketDataSource`. Start with the combined stream WebSocket connection manager, then wire prices into the Sidebar and DashboardPage stat cards.
