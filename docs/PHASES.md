# PHASES.md

**Last Updated:** 2026-05-16

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

**Status:** ACTIVE — NEXT
**Depends On:** Phase 1 ✅

### Objectives
- Implement Binance WebSocket connection manager (MarketDataSource)
- Wire live prices into PricesStore and Sidebar
- Coin search + add-to-watchlist flow
- Remove from watchlist
- 24h price change % display

### Completion Conditions
- [ ] BinanceCryptoSource implements MarketDataSource interface
- [ ] Binance WebSocket connects and streams live prices into PricesStore
- [ ] Sidebar shows live price + 24h change for each watchlist item
- [ ] Dashboard stat cards show live data for active symbol
- [ ] User can search coins and add to watchlist
- [ ] User can remove coins from watchlist
- [ ] WebSocket reconnects on disconnect

---

## Phase 3 — Charting

**Status:** PENDING
**Depends On:** Phase 2

### Objectives
- Integrate TradingView Lightweight Charts
- OHLCV data pipeline (Binance REST → Vercel Function → Supabase cache)
- Candlestick chart + Line chart with toggle
- Time range selector (15m, 1h, 4h, 1D, 1W, 1M)
- Chart updates on watchlist symbol click

### Completion Conditions
- [ ] Candlestick chart renders for active symbol
- [ ] Line chart toggle works
- [ ] OHLCV data cached in Supabase (reduces API calls on repeat visits)
- [ ] Time range selector functional
- [ ] Clicking watchlist item updates chart symbol

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
