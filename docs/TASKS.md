# TASKS.md

**Last Updated:** 2026-05-18
**Current Phase:** Phase 3C — Chart System Consolidation + Advanced Chart Foundation

---

## Active Tasks (Phase 3B — Close Out First)

- [ ] P3B-CMT: Commit Phase 3B (`user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`)
- [ ] P3B-PR: Push → PR `feature/live-price-engine` → `develop`

---

## Upcoming Tasks (Phase 3C — Awaiting P3B Close-Out)

### 3C-A — `useChartEngine` Hook + Series Registry + `PriceChart` Refactor

- [x] P3C-A01: Create `frontend/src/types/chart.ts` — `ChartType`, `SeriesKey`, `PriceChartContext`
- [x] P3C-A02: Create `frontend/src/hooks/useChartEngine.ts` — chart lifecycle + series registry
  - `addSeries(key, definition, options)` — replaces existing, cleans up old
  - `removeSeries(key)` — safe remove with existence guard
  - `getSeries(key)` — typed lookup
  - `clearAllSeries()` — full teardown on context reset
  - Returns: `{ chartRef, addSeries, removeSeries, getSeries, clearAllSeries, isReady }`
- [x] P3C-A03: Create `frontend/src/components/charts/PriceChart.tsx`
  - Props: `{ symbol, interval, chartType }`
  - `contextRef` upgraded to track `{ symbol, interval, chartType }`
  - Uses `useChartEngine` for all series operations
  - Price series (`'price'`): candlestick or line based on `chartType` prop
  - Series swap on `chartType` change — no chart recreation
  - `historyReadyRef.current = false` on any context dimension change
- [x] P3C-A04: Delete `frontend/src/components/charts/CandlestickChart.tsx`
- [x] P3C-A05: Update `DashboardPage.tsx` — import `PriceChart`, add `chartType` state
- [x] P3C-A06: `npm run build` → 0 TypeScript errors (994ms, 155KB gzipped)

### 3C-B — Volume Histogram

- [x] P3C-B01: Add `'volume'` `HistogramSeries` to `PriceChart` via `useChartEngine`
  - `priceScaleId: 'volume'` — isolated scale, no price axis interference
  - Scale margins: `{ top: 0.75, bottom: 0 }` — volume in bottom 25% of main pane
  - Directional coloring: `c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'`
- [x] P3C-B02: Volume series data lifecycle — same `historyReadyRef` gate as price series
  - `setData()` on context change / history load
  - `update()` on live tick (alongside price `update()`)
- [x] P3C-B03: Volume series cleanup — `clearAllSeries()` on unmount covers this automatically

### 3C-C — Chart Type Toggle

- [x] P3C-C01: Create `frontend/src/components/charts/ChartTypeSelector.tsx`
  - Props: `{ type: ChartType, onChange: (type: ChartType) => void }`
  - Buttons: Candles | Line — same styling pattern as `TimeframeSelector`
- [x] P3C-C02: Wire `ChartTypeSelector` into `DashboardPage` header
- [ ] P3C-C03: Verify series swap on chart type change — no chart recreation, volume persists — **runtime verify**

### 3C-D — Indicator/Overlay Architecture Documentation

- [x] P3C-D01: Update `ARCHITECTURE.md` — chart engine section (done in Session 006)
- [x] P3C-D02: Update `DECISIONS.md` — DEC-018 added (done in Session 006)

### 3C-E — Render Performance Verification

- [x] P3C-E01: Live tick path — exactly 2 `series.update()` calls per kline (code verified)
- [x] P3C-E02: `setData()` strictly in `!historyReadyRef` branch — never in live-update mode (code verified)
- [x] P3C-E03: Price scale reset scoped to `isSymbolChange` only — not interval or chartType change (code verified)
- [x] P3C-E04: RAF `fitContent()` correct after multi-series refactor (code verified — same pattern)

### 3C-F — Phase 3C Close-Out

- [ ] P3C-VER: Human runtime verification — chart type toggle, volume visible, symbol switch, interval switch, live updates, no memory leaks
- [ ] P3C-CMT: Commit Phase 3C (`user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`)
- [ ] P3C-PR: Push → PR `feature/live-price-engine` → `develop`

---

## Completed Tasks (Phase 3B)

- [x] P3B-VER: Human runtime verification — chart renders live, symbol switch works, no loop
- [x] P3B-001: `CandlestickChart` component — TradingView v5, `addSeries(CandlestickSeries)`, dark theme
- [x] P3B-002: `TimeframeSelector` component — 1m / 5m / 15m / 1h / 4h / 1D button group
- [x] P3B-003: `DashboardPage` wired — chart + timeframe selector + stat cards
- [x] P3B-004: `npm run build` clean — 0 TypeScript errors, 1.07s, 152KB gzipped
- [x] P3B-005: Phase 3A corrections applied — branch push confirmed, no-main-merge rule recorded
- [x] P3B-006: Bug fix — infinite re-render loop (Zustand selector `?? []` → stable `undefined`)
- [x] P3B-007: Bug fix — symbol switch price scale not resetting (added `priceScale().applyOptions({ autoScale: true })`)
- [x] P3B-008: Bug fix — race condition dropping 299 historical candles (split `contextRef` + `historyReadyRef`)
- [x] P3B-009: Bug fix — viewport synchronization (`fitContent()` moved into `requestAnimationFrame`)

---

## Completed Tasks

### Phase 3A — Centralized Market State Infrastructure — COMPLETE (2026-05-18)
- [x] P3A-001: `useMarketStore` — 4 slices: tickers, klines, symbols, connection
- [x] P3A-002: `BinanceCryptoSource.subscribeToKlines()` — live kline stream
- [x] P3A-003: `updateKlineCandle` merge engine — rolling 500-candle window
- [x] P3A-004: `useKlineData` hook — historical REST + live stream subscription
- [x] P3A-005: `usePricesStore` deleted — zero remaining imports
- [x] P3A-006: `npm run build` → 0 TypeScript errors
- [x] P3A-007: Committed (`aa94f7a`), branch pushed

### Phase 2 — Live Price Engine — COMPLETE (2026-05-18)
- [x] P2-001: `BinanceCryptoSource` — implements `MarketDataSource`, combined miniTicker stream, exponential backoff
- [x] P2-002: Sidebar watchlist — live price + 24h change % (green/red)
- [x] P2-003: DashboardPage stat cards — Price, Change 24h, Volume 24h, High/Low — live
- [x] P2-004: AddSymbolSearch — Binance exchangeInfo, inline search, TanStack Query cache (1h stale)
- [x] P2-005: Remove-from-watchlist X button on hover, unsubscribes price stream

### Phase 1.5 — Infrastructure Stabilization — COMPLETE (2026-05-16)
- [x] UA-001: GitHub repository created (`github.com/Gampunk/MarketPulse`) — `main` + `develop` branches
- [x] UA-002: Supabase project created — URL + anon key configured
- [x] UA-003: Vercel project linked — production + preview deployments operational

### Phase 1 — Project Foundation — COMPLETE (2026-05-16)
- [x] P1-001 through P1-016: Full scaffold, Tailwind v4, shadcn/ui, path aliases, type system, stores, layout, routing, build
