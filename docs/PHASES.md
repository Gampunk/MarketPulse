# PHASES.md

**Last Updated:** 2026-05-18
**Active Sub-phase:** Phase 3A — complete pending verification

---

## Phase 0 — Project Initialization

**Status:** COMPLETE
**Completed:** 2026-05-16

### Objectives
- Verify environment readiness
- Stabilize technical direction
- Select and approve core stack
- Initialize operational documentation

### Completion Conditions
- [x] Development environment operational
- [x] Stack selected and approved
- [x] Architecture direction stabilized
- [x] All operational documents initialized
- [x] Phase 1 task list prepared

---

## Phase 1 — Project Foundation

**Status:** COMPLETE
**Completed:** 2026-05-16

### Objectives
- Initialize Git repository
- Scaffold React + Vite + TypeScript project
- Configure Tailwind CSS v4 + shadcn/ui
- Build base layout and routing
- Scaffold Vercel Functions backend
- Define TypeScript type system for market data
- Create Zustand stores (watchlist, prices)

### Completion Conditions
- [x] Git repo initialized with main branch
- [x] React + Vite dev server running without errors (473ms cold start)
- [x] Tailwind v4 utility classes rendering correctly
- [x] shadcn/ui configured (components.json + cn utility)
- [x] Path alias `@/` working
- [x] Core dependencies installed (TanStack Query, Zustand, Lightweight Charts, React Router)
- [x] TypeScript type system defined (MarketDataSource interface)
- [x] Zustand stores: watchlist (localStorage persist) + prices
- [x] AppLayout + TopBar + Sidebar rendered
- [x] DashboardPage placeholder
- [x] /api/health Vercel Function created
- [x] vercel.json build config
- [x] .env.example documented
- [x] `npm run build` passes — 0 errors, 715ms

---

## Phase 2 — Live Price Engine

**Status:** COMPLETE
**Completed:** 2026-05-18

### Objectives
- Implement Binance WebSocket connection manager (MarketDataSource)
- Wire live prices into PricesStore and Sidebar
- Coin search + add-to-watchlist flow
- Remove from watchlist
- 24h price change % display

### Completion Conditions
- [x] BinanceCryptoSource implements MarketDataSource interface
- [x] Binance WebSocket connects and streams live prices into PricesStore
- [x] Sidebar shows live price + 24h change for each watchlist item
- [x] Dashboard stat cards show live data for active symbol
- [x] User can search coins and add to watchlist
- [x] User can remove coins from watchlist
- [x] WebSocket reconnects on disconnect

---

## Phase 3 — Charting

**Status:** IN PROGRESS (Phase 3A complete, 3B pending)
**Depends On:** Phase 2

### Sub-phases

#### Phase 3A — Centralized Market State Infrastructure
**Status:** COMPLETE (pending human verification + commit)
**Completed:** 2026-05-18

**Objectives:**
- Centralized Zustand market store (`useMarketStore`) replacing `usePricesStore`
- MarketDataSource interface expansion (`subscribeToKlines`)
- BinanceCryptoSource evolved: handles ticker + kline streams on one connection
- Standalone REST fetcher layer (`api/rest/binance.ts`)
- `useKlineData` hook: historical fetch (TanStack Query) + live stream subscription
- Candle merge engine in market store (`updateKlineCandle`, 500-candle rolling window)
- Component migration from `usePricesStore` → `useMarketStore`
- Delete deprecated `stores/prices.ts`

**Completion Conditions:**
- [x] `useMarketStore` has tickers, klines, symbols, connection slices
- [x] `BinanceCryptoSource.subscribeToKlines()` implemented
- [x] `updateKlineCandle` merge logic: live replace, closed append, discard stale
- [x] `useKlineData` hook deposits history + subscribes live kline stream
- [x] `DashboardPage` shows "1m candles loaded: N" (Phase 3A verification)
- [x] `usePricesStore` deleted — zero remaining imports
- [x] `npm run build` → 0 TypeScript errors
- [ ] Human runtime verification (browser checklist)
- [ ] Phase 3A commit pushed

#### Phase 3B — Chart Component (TradingView)
**Status:** PENDING (begins after Phase 3A verification)

**Objectives:**
- Integrate TradingView Lightweight Charts v5
- Candlestick chart consuming `useMarketStore` klines slice
- Chart updates when active symbol changes in watchlist
- Chart updates live as new candles arrive via WebSocket

**Completion Conditions:**
- [ ] `CandlestickChart` component renders OHLCV data for active symbol
- [ ] Chart updates in real-time as kline stream fires
- [ ] Switching watchlist symbol updates chart
- [ ] No duplicate WebSocket connections introduced
- [ ] Zero TypeScript errors

#### Phase 3C — Timeframe Selector
**Status:** PENDING (begins after Phase 3B verification)

**Objectives:**
- Timeframe selector UI (1m, 5m, 15m, 1h, 4h, 1D)
- `useKlineData` receives selected interval from UI
- Store holds klines per symbol per interval
- Chart re-fetches history when interval changes

**Completion Conditions:**
- [ ] Timeframe selector renders (1m, 5m, 15m, 1h, 4h, 1D)
- [ ] Selecting interval triggers REST fetch for new interval's history
- [ ] Live kline stream switches to new interval
- [ ] Chart re-renders with correct timeframe data
- [ ] No regression in ticker streams or existing intervals

### Architecture Decision (Phase 3)
- **OHLCV source:** Browser-direct Binance REST (no Vercel Function proxy) — deferred to Phase 4 (DEC-017)
- **Stream manager:** Evolved `BinanceCryptoSource` (not a new class) — DEC-016
- **Execution order:** 3A → 3B → 3C. Each sub-phase verified before the next begins — MANDATORY

---

## Phase 4 — Dashboard Depth

**Status:** PENDING
**Depends On:** Phase 3

### Objectives
- Market overview panel (top gainers/losers)
- Global market stats (BTC dominance, total cap via CoinGecko)
- Coin metadata panel (logos, market cap, via CoinGecko)
- Volume bars on charts
- Dark mode polish + UI refinement

---

## Phase 5 — Stabilization + Phase 2 Prep

**Status:** PENDING
**Depends On:** Phase 4

### Objectives
- Error boundaries + WebSocket reconnection polish
- Forex data source research + MarketDataSource connector abstraction
- Performance profiling
- Tech debt cleanup
- Prepare for forex integration

---

## Future Phases (Roadmap)

- Phase 6: Forex integration
- Phase 7: User accounts + Supabase Auth
- Phase 8: Price alerts system
- Phase 9: AI-assisted market insights
- Phase 10: Advanced charting (indicators, drawing tools)
