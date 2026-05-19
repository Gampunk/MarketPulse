# PHASES.md

**Last Updated:** 2026-05-18
**Active Sub-phase:** Phase 3B — Chart Component (IN PROGRESS)

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

**Status:** IN PROGRESS (Phase 3A complete, 3B complete pending commit, 3C defined)
**Depends On:** Phase 2

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
- [x] `DashboardPage` shows "1m candles loaded: N" (Phase 3A verification)
- [x] `usePricesStore` deleted — zero remaining imports
- [x] `npm run build` → 0 TypeScript errors
- [x] Human runtime verification (browser checklist)
- [x] Phase 3A commit pushed (`aa94f7a`)

#### Phase 3B — Chart Component + Timeframe Selector (TradingView)
**Status:** COMPLETE — runtime verified, pending commit + PR
**Completed:** 2026-05-18

**Objectives:**
- Integrate TradingView Lightweight Charts v5
- `CandlestickChart` — reusable, consumes `useMarketStore` klines slice via `useKlineData`
- Live candlestick rendering — chart updates as kline stream fires
- Symbol switching — chart resets and loads history for new symbol
- Timeframe switching — `TimeframeSelector` UI (1m, 5m, 15m, 1h, 4h, 1D)
- Responsive resizing — `autoSize: true` fills container (TradingView managed)
- Efficient re-render — `series.update()` for live ticks, `series.setData()` only on context change
- Clean teardown lifecycle — `chart.remove()` on unmount

**Architecture constraint (non-negotiable):**
Charts are consumers of centralized market state — never owners.
`Binance WS → BinanceCryptoSource → useMarketStore → useKlineData → CandlestickChart`
Charts must never fetch Binance directly, never manage WebSocket lifecycle, never duplicate merge logic.

**Bugs resolved in Phase 3B:**
- Infinite re-render loop — Zustand selector `?? []` returned new reference each call; fixed by accessing stable `undefined`
- Symbol switch price scale not resetting — added `priceScale().applyOptions({ autoScale: true })` on context change
- Race condition dropping historical candles — split `contextRef` (active context) + `historyReadyRef` (history gate)
- Viewport synchronization — moved `fitContent()` into `requestAnimationFrame()`; guarded by `HISTORY_READY_THRESHOLD`

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
**Status:** DEFINED — begins after Phase 3B commit + PR
**Scope:** Foundational systems engineering for the future chart ecosystem. Not cosmetic.

**Rationale:**
Phase 3B delivered a working MVP chart. However, `CandlestickChart` is monolithic — chart
lifecycle, series management, data sync, and rendering are co-located in one component.
Before introducing CoinGecko metadata, market overview, and analytics layers, the chart engine
must be extensible. Volume, chart type switching, and future indicators (RSI, MACD, Bollinger)
require a series registry, a composition contract, and a pane strategy. Phase 3C establishes all of this.

**Objectives:**
- Extract `useChartEngine` hook — chart lifecycle + series registry (add/remove/get/clearAll by key)
- Introduce `PriceChart.tsx` (supersedes `CandlestickChart.tsx`) — multi-series, type-switchable
- `contextRef` upgraded: tracks `{ symbol, interval, chartType }` — full context for reset detection
- Volume histogram — `HistogramSeries` on `priceScaleId: 'volume'`, directional green/red coloring
- Chart type toggle — `ChartTypeSelector` (Candles | Line), series swap without chart recreation
- Pane strategy defined: Pane 0 (price + overlays + volume), Pane 1+ (oscillators)
- Indicator hook contract documented: `useXxxIndicator(engine, candles, options) => void`
- Render performance: price scale reset scoped to symbol change only (not interval or chart type)
- All existing architecture constraints preserved: charts remain downstream consumers

**New files:**
- `frontend/src/types/chart.ts` — `ChartType`, `SeriesKey`, `PriceChartContext`
- `frontend/src/hooks/useChartEngine.ts` — chart + series lifecycle hook
- `frontend/src/components/charts/PriceChart.tsx` — unified chart component
- `frontend/src/components/charts/ChartTypeSelector.tsx` — Candles/Line toggle

**Deleted files:**
- `frontend/src/components/charts/CandlestickChart.tsx` — superseded by `PriceChart.tsx`

**Completion Conditions:**
- [ ] `useChartEngine` hook — series registry with add/remove/get/clearAll, chart lifecycle
- [ ] `PriceChart.tsx` — renders candlestick or line based on `chartType` prop
- [ ] Volume histogram visible — directional coloring, isolated scale, bottom 25% of pane
- [ ] Chart type toggle working — Candles ↔ Line, no chart recreation on switch
- [ ] Volume persists across chart type switch
- [ ] `ChartTypeSelector` renders in dashboard header
- [ ] `contextRef` tracks `{ symbol, interval, chartType }` — all three dimensions
- [ ] Price scale reset only fires on symbol change
- [ ] `ARCHITECTURE.md` updated — chart engine API, pane convention, indicator hook contract
- [ ] `DECISIONS.md` — DEC-018 added (chart engine architecture)
- [ ] Zero TypeScript errors (`npm run build` clean)
- [ ] Human runtime verification checklist
- [ ] Commit + PR to `develop`

### Architecture Decision (Phase 3)
- **OHLCV source:** Browser-direct Binance REST (no Vercel Function proxy) — deferred to Phase 4 (DEC-017)
- **Stream manager:** Evolved `BinanceCryptoSource` (not a new class) — DEC-016
- **Chart engine:** `useChartEngine` hook — series registry pattern (DEC-018, Phase 3C)
- **Execution order:** 3A → 3B → 3C. Each sub-phase verified before the next begins — MANDATORY

---

## Phase 4 — Market Intelligence + Analytics Ecosystem

**Status:** DEFINED — begins after Phase 3C (complete)
**Depends On:** Phase 3

### Rationale

Phase 3 established real-time data infrastructure. Phase 4 shifts from raw data to contextual intelligence — coin identity, global market ranking, market-wide movers. This is the beginning of the platform intelligence layer.

### Sub-phases

#### Phase 4A — Symbol Metadata Enrichment
**Status:** DEFINED

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
- [ ] `types/metadata.ts` — CoinMeta, GlobalMarketStats, TopMoverCoin
- [ ] `api/rest/coingecko.ts` — fetchCoinMetadata, fetchGlobalStats, fetchTopMovers
- [ ] `useMarketStore.coinMetadata` slice — setCoinMetadata, getCoinMeta
- [ ] `useMetadataEnrichment` hook — called from App.tsx, deposits top 100 coins
- [ ] Sidebar logos visible for all default watchlist symbols
- [ ] Dashboard header shows coin name + rank
- [ ] Graceful fallback for symbols not in top 100
- [ ] Zero TypeScript errors
- [ ] Human runtime verification

#### Phase 4B — Market Overview Panel
**Status:** DEFINED (after Phase 4A)

**Objectives:**
- Top gainers + losers panel — CoinGecko /coins/markets sorted by 24h change
- Global market stats row — total market cap, BTC dominance (CoinGecko /global)
- useMarketOverview hook — refetchInterval: 10min (CoinGecko free tier safe)
- MarketOverview component — below stat cards on DashboardPage

**Architecture constraints:**
- Market overview data lives in TanStack Query cache — server state, not Zustand
- Polling at 10-minute interval — ~288 req/day combined, within CoinGecko free tier
- No new WebSocket connections

**Completion Conditions:**
- [ ] useMarketOverview hook — useTopMovers + useGlobalStats, 10min refetch
- [ ] MarketOverview component — gainers, losers, global stats
- [ ] Integrated below stat cards on DashboardPage
- [ ] Zero TypeScript errors
- [ ] Human runtime verification

### Architecture Decisions (Phase 4)
- Metadata namespace: coinMetadata keyed by baseAsset — DEC-019
- CoinGecko as leaf module: not a MarketDataSource — DEC-019
- Market overview state: TanStack Query cache only (server state, not Zustand)
- Rate limit: 10min polling for overview data — CoinGecko free tier safe

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
