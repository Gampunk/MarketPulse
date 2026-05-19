# PHASES.md

**Last Updated:** 2026-05-19
**Active Sub-phase:** Phase 4B — Market Overview + Analytics Layer (COMPLETE — pending close-out)

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

**Status:** COMPLETE
**Completed:** 2026-05-18

### Sub-phases

#### Phase 3A — Centralized Market State Infrastructure
**Status:** COMPLETE — committed (`aa94f7a`), branch pushed
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
- [x] `usePricesStore` deleted — zero remaining imports
- [x] `npm run build` → 0 TypeScript errors
- [x] Human runtime verification (browser checklist)
- [x] Phase 3A commit pushed (`aa94f7a`)

#### Phase 3B — Chart Component + Timeframe Selector (TradingView)
**Status:** COMPLETE — committed (`faed40a`), pushed
**Completed:** 2026-05-18

**Completion Conditions:**
- [x] `CandlestickChart` renders OHLCV candlestick data for active symbol
- [x] Chart updates live every tick (via store — no direct WS access)
- [x] Switching watchlist symbol resets chart + loads new history
- [x] TimeframeSelector renders: 1m, 5m, 15m, 1h, 4h, 1D
- [x] Selecting interval fetches new history + switches live stream
- [x] Responsive — chart fills container via `autoSize: true`
- [x] Exactly one WebSocket connection at all times — runtime verified
- [x] No memory leaks — cleanup verified on symbol/interval/unmount
- [x] Zero TypeScript errors (`npm run build` clean, 1.07s)
- [x] No regression in ticker streams or sidebar live prices — runtime verified

#### Phase 3C — Chart System Consolidation + Advanced Chart Foundation
**Status:** COMPLETE — committed (`55225dc`), pushed, included in PR #1
**Completed:** 2026-05-18

**New files:**
- `frontend/src/types/chart.ts` — `ChartType`, `SeriesKey`, `PriceChartContext`
- `frontend/src/hooks/useChartEngine.ts` — chart + series lifecycle hook
- `frontend/src/components/charts/PriceChart.tsx` — unified chart component
- `frontend/src/components/charts/ChartTypeSelector.tsx` — Candles/Line toggle

**Deleted files:**
- `frontend/src/components/charts/CandlestickChart.tsx` — superseded by `PriceChart.tsx`

**Completion Conditions:**
- [x] `useChartEngine` hook — series registry with add/remove/get/clearAll, chart lifecycle
- [x] `PriceChart.tsx` — renders candlestick or line based on `chartType` prop
- [x] Volume histogram visible — directional coloring, isolated scale, bottom 25% of pane
- [x] Chart type toggle working — Candles ↔ Line, no chart recreation on switch
- [x] Volume persists across chart type switch
- [x] `ChartTypeSelector` renders in dashboard header
- [x] `contextRef` tracks `{ symbol, interval, chartType }` — all three dimensions
- [x] Price scale reset only fires on symbol change
- [x] `ARCHITECTURE.md` updated — chart engine API, pane convention, indicator hook contract
- [x] `DECISIONS.md` — DEC-018 added (chart engine architecture)
- [x] Zero TypeScript errors (`npm run build` clean)
- [x] Human runtime verification checklist
- [x] Commit + PR to `develop`

### Architecture Decisions (Phase 3)
- **OHLCV source:** Browser-direct Binance REST (no Vercel Function proxy) — deferred (DEC-017)
- **Stream manager:** Evolved `BinanceCryptoSource` (not a new class) — DEC-016
- **Chart engine:** `useChartEngine` hook — series registry pattern (DEC-018, Phase 3C)
- **Execution order:** 3A → 3B → 3C. Each sub-phase verified before the next begins — MANDATORY

---

## Phase 4 — Market Intelligence + Analytics Ecosystem

**Status:** COMPLETE (Phase 4A + 4B runtime-verified — pending close-out commit)
**Completed:** 2026-05-19

### Sub-phases

#### Phase 4A — Symbol Metadata Enrichment
**Status:** COMPLETE — runtime verified locally
**Completed:** 2026-05-19

**Objectives:**
- CoinGecko REST client (`api/rest/coingecko.ts`) — leaf module, standalone functions, no class
- `coinMetadata` slice in `useMarketStore` — keyed by baseAsset ("BTC"), separate from exchange symbols
- `useMetadataEnrichment` hook — TanStack Query at app root level (stale 1hr), deposits into store
- Sidebar: coin logo + name in WatchlistRow — graceful fallback if no metadata
- Dashboard header: coin name + market cap rank badge

**Architecture constraints:**
- CoinGecko is a leaf REST module — never a MarketDataSource, never owns WebSocket
- Metadata flow: CoinGecko REST → useMetadataEnrichment → useMarketStore.coinMetadata → components
- Chart engine has zero knowledge of CoinGecko — metadata and chart layers fully decoupled
- coinMetadata keyed by baseAsset — future-safe for non-USDT pairs and forex

**Completion Conditions:**
- [x] `types/metadata.ts` — CoinMeta, GlobalMarketStats, TopMoverCoin
- [x] `api/rest/coingecko.ts` — fetchCoinMetadata, fetchGlobalStats, fetchMarketMovers
- [x] `useMarketStore.coinMetadata` slice — setCoinMetadata, getCoinMeta
- [x] `useMetadataEnrichment` hook — called from App.tsx, deposits top 100 coins
- [x] Sidebar logos visible for all default watchlist symbols
- [x] Dashboard header shows coin name + rank
- [x] Graceful fallback for symbols not in top 100
- [x] Zero TypeScript errors
- [x] Human runtime verification

#### Phase 4B — Market Overview Panel + Analytics Orchestration
**Status:** COMPLETE — runtime verified locally (3 screenshot sessions)
**Completed:** 2026-05-19

**Architecture decision (DEC-020):** Analytics Orchestrator Pattern — single `useAnalyticsOrchestrator`
hook at AppCore level (mirrors `usePriceStream` and `useMetadataEnrichment` patterns). Components
are pure store consumers. No component-owned polling, no direct CoinGecko fetches in UI.

**Key decisions:**
- Analytics state lives in Zustand (`useMarketStore.analytics`) — not TanStack Query cache only
- 15min refresh cadence (9 req/hr = 216 req/day — well within CoinGecko free tier ~500/day)
- CoinGecko free-tier ordering bug: `order=price_change_*` params silently ignored — fetches top-200
  by market cap and sorts client-side instead of calling two broken sorted endpoints
- `lastRefreshedAt` fires only when BOTH analytics queries complete a cycle — designed hook point
  for future AI narrative systems
- `MarketOverview` wrapped in `React.memo()` — prevents ~1/sec price-tick re-renders

**Completion Conditions:**
- [x] `useAnalyticsOrchestrator` hook — parallel useQueries, deposits to analytics slice
- [x] `useMarketStore.analytics` slice — topGainers, topLosers, globalStats, lastRefreshedAt
- [x] `fetchMarketMovers(universeSize, topN)` — client-side sort/filter (free-tier bug workaround)
- [x] `MarketOverview` component — global stats bar, gainers/losers tabs, skeleton loading
- [x] `MarketOverview` wrapped in `React.memo()` — no price-tick re-renders
- [x] Integrated below stat cards on DashboardPage
- [x] `formatVolume` updated — trillion case for global market cap display
- [x] Volume axis hidden — value surfaced via crosshair hover tooltip (volume bubble overlay)
- [x] Page scrollable — `h-full` removed, responsive chart height (`clamp(300px, 45vh, 560px)`)
- [x] Keyboard scroll — `tabIndex={-1}` on `<main>`
- [x] `ANALYTICS_REFRESH_MS = 15 * 60 * 1000` — defined once, no magic literals
- [x] Zero TypeScript errors (`npm run build` clean, 158.76KB gzipped)
- [x] Human runtime verification (3 screenshot sessions)

### Architecture Decisions (Phase 4)
- Metadata namespace: coinMetadata keyed by baseAsset — DEC-019
- CoinGecko as leaf module: not a MarketDataSource — DEC-019
- Analytics state: Zustand analytics slice (not TanStack Query cache only) — DEC-020
- Analytics orchestration: single AppCore-level hook (not per-component polling) — DEC-020
- Rate budget: 15min polling for analytics — 9 req/hr, 216 req/day — DEC-020

---

## Phase 5 — Stabilization + Production Hardening

**Status:** PENDING
**Depends On:** Phase 4 close-out + merge to develop

### Objectives
- WebSocket reconnection UI indicator
- React error boundaries
- CI/CD: GitHub Actions (TypeScript check + ESLint + build gate)
- Technical debt cleanup (TD-003, TD-004, TD-005, TD-006, TD-007, TD-010, TD-011, TD-012, TD-015, TD-017)
- Production reliability instrumentation
- Performance profiling
- Merge `develop → main` as stable MVP release

---

## Future Phases (Roadmap)

- Phase 6: Forex integration
- Phase 7: User accounts + Supabase Auth
- Phase 8: Price alerts system
- Phase 9: AI-assisted market insights
- Phase 10: Advanced charting (indicators, drawing tools)
