# CHANGELOG.md

**Last Updated:** 2026-05-19

---

## [Unreleased] — Phase 4B: Market Overview + Analytics Layer

### Added
- `src/hooks/useAnalyticsOrchestrator.ts` — AppCore-level analytics orchestration hook
  - Parallel `useQueries` for market-movers and global-stats (TanStack Query)
  - `ANALYTICS_REFRESH_MS = 15 * 60 * 1000` — 15min cadence, 9 req/hr, 216 req/day
  - `lastRefreshedAt` fires only when BOTH queries complete a cycle — designed AI hook point
  - `refetchOnWindowFocus: false` on all queries
- `src/components/market/MarketOverview.tsx` — analytics panel component
  - `React.memo()` wrapper — prevents price-tick-driven re-renders (~1/sec tick isolation)
  - Global stats bar: Market Cap (T/B/M), BTC Dominance %, 24h Market Change
  - Top Gainers / Top Losers tabs — MoverRow (logo, symbol, name, price, 24h%)
  - `formatRelativeTime` — "Just now" / "X min ago" for last refresh display
  - `SkeletonRows` — 5 animated placeholder rows while data is in flight
  - `TabButton` with active underline (green/gainers, red/losers) and count badge
- `src/stores/market.ts` — `analytics` slice added to `useMarketStore`
  - `topGainers: TopMoverCoin[]`, `topLosers: TopMoverCoin[]`
  - `globalStats: GlobalMarketStats | null`
  - `lastRefreshedAt: number | null`
  - `setTopGainers`, `setTopLosers`, `setGlobalStats`, `setAnalyticsLastRefreshed` — Zustand devtools named actions

### Updated
- `src/api/rest/coingecko.ts` — analytics API methods
  - Replaced `fetchTopGainers` + `fetchTopLosers` with `fetchMarketMovers(universeSize, topN)`
  - CoinGecko free-tier ordering bug workaround: fetches top-200 by market cap, sorts/filters client-side
  - Gainers: `changePct24h > 0` sorted descending. Losers: `changePct24h < 0` sorted ascending
  - Coins can never appear in both lists (mutually exclusive filter)
  - `fetchGlobalStats()` added
- `src/lib/formatters.ts` — `formatVolume` trillion case
  - `>= 1_000_000_000_000` → `${n}T` — required for global market cap display
- `src/App.tsx` — `useAnalyticsOrchestrator()` called in `AppCore` alongside existing side-effect hooks
- `src/pages/DashboardPage.tsx` — layout and MarketOverview integration
  - `<MarketOverview />` added below stat cards
  - Removed `h-full` from outer div — content now naturally scrollable
  - Chart container: `h-[clamp(300px,45vh,560px)]` — responsive, 300px min / 560px max
- `src/components/layout/AppLayout.tsx` — keyboard scroll support
  - `tabIndex={-1}` and `outline-none` on `<main>` — element focused on click, arrow-key scroll works
- `src/components/charts/PriceChart.tsx` — volume tooltip
  - `VOLUME_SCALE_OPTIONS`: added `visible: false, borderVisible: false` — removes persistent axis label
  - `subscribeCrosshairMove` handler — reads bar data at hovered candle, sets `volumeTooltip` state
  - Absolute-positioned bubble overlay (top-left) — shows vol value + directional color on hover
  - Disappears when crosshair leaves chart

### Fixed
- **BUG-001:** Top gainers and losers showing identical coins — CoinGecko free-tier ordering bug; fixed by client-side sort
- **BUG-002:** Chart squeezed when MarketOverview added — `h-full` layout trap; fixed by removing constraint
- **BUG-003:** Page not scrollable — same `h-full` trap; fixed + `tabIndex={-1}` for keyboard scroll
- **BUG-004:** Volume price axis persistent label — `visible: false` added to VOLUME_SCALE_OPTIONS

### Validated
- `npm run build` — 0 TypeScript errors, 1.04s, 158.76KB gzipped
- Human runtime verification: 3 screenshot sessions — analytics panel, gainers/losers tabs, global stats, volume tooltip, scroll, keyboard scroll

---

## [0.5.0] — 2026-05-19 — Phase 4A: Symbol Metadata Enrichment

### Added
- `src/types/metadata.ts` — `CoinMeta`, `GlobalMarketStats`, `TopMoverCoin`
- `src/api/rest/coingecko.ts` — CoinGecko REST leaf module
  - `fetchCoinMetadata()` — top 100 coins by market cap (`/coins/markets?per_page=100`)
  - Module-level `REST_BASE`, standalone functions, no class
- `src/hooks/useMetadataEnrichment.ts` — AppCore-level metadata enrichment
  - TanStack Query, `staleTime: 60 * 60 * 1000` (1hr), deposits into `useMarketStore.coinMetadata`
  - `refetchOnWindowFocus: false`

### Updated
- `src/stores/market.ts` — `coinMetadata` slice added
  - `coinMetadata: Record<string, CoinMeta>` keyed by baseAsset ("BTC")
  - `setCoinMetadata(coins: CoinMeta[])`, `getCoinMeta(symbol: string): CoinMeta | undefined`
- `src/App.tsx` — `useMetadataEnrichment()` called in `AppCore` (AppCore pattern established)
- `src/components/layout/Sidebar.tsx` — metadata enrichment
  - `CoinIcon` sub-component: logo `<img>` with `onError` hide + `TrendingUp` fallback
  - Coin name secondary text below symbol in watchlist rows
- `src/pages/DashboardPage.tsx` — header enrichment
  - Coin logo (with `onError` hide), full coin name (`meta.name ?? baseAsset`)
  - Market cap rank badge (`#${meta.marketCapRank}`)
  - Subtitle: `{activeSymbol} · Real-time market data`

### Validated
- `npm run build` — 0 TypeScript errors, 720ms, 156KB gzipped
- Human runtime verification: logos visible in sidebar, name + rank in header, graceful fallback for unknown coins

---

## [0.4.1] — 2026-05-18 — Phase 3C: Chart System Consolidation

### Added
- `src/types/chart.ts` — `ChartType` (`'candlestick' | 'line'`), `SeriesKey`, `PriceChartContext`
- `src/hooks/useChartEngine.ts` — chart lifecycle + series registry hook
  - `addSeries(key, SeriesDefinition, options)` — replaces existing series if present (no chart recreation)
  - `removeSeries(key)` — safe remove with existence guard
  - `getSeries(key)` — typed lookup
  - `clearAllSeries()` — full teardown on unmount
  - Returns `{ chartRef, addSeries, removeSeries, getSeries, clearAllSeries, isReady }`
- `src/components/charts/PriceChart.tsx` — unified chart (supersedes CandlestickChart)
  - Props: `{ symbol, interval, chartType }`
  - `contextRef` tracks `{ symbol, interval, chartType }` — full 3-dimension context for reset detection
  - Volume `HistogramSeries` on `priceScaleId: 'volume'` — directional green/red, bottom 25% of pane
  - Price series swap on `chartType` change — no chart recreation, volume persists
  - Price scale recalibration scoped to symbol change only
- `src/components/charts/ChartTypeSelector.tsx` — Candles | Line toggle

### Updated
- `src/pages/DashboardPage.tsx` — `PriceChart` + `ChartTypeSelector` wired, `chartType` state

### Deleted
- `src/components/charts/CandlestickChart.tsx` — superseded by `PriceChart.tsx`

### Validated
- `npm run build` — 0 TypeScript errors, 994ms, 155KB gzipped
- Human runtime verification: chart type toggle, volume histogram, volume persistence across type switch, symbol/interval switch, WS singleton preserved

---

## [0.4.0] — 2026-05-18 — Phase 3A: Centralized Market State Infrastructure

### Added
- `src/stores/market.ts` — `useMarketStore` (Zustand v5 + Redux DevTools, dev-only)
  - `tickers` slice: full TickData per symbol (replaces usePricesStore)
  - `klines` slice: Candle[] per symbol per interval, 500-candle rolling window
  - `symbols` slice: MarketSymbol lookup map (for coin search)
  - `connection` slice: status (connecting/connected/disconnected), reconnect count, lastConnectedAt
  - `updateKlineCandle` merge engine: live replace / closed append / stale discard
- `src/api/rest/binance.ts` — standalone REST fetchers
  - `fetchKlines(symbol, interval, limit)` → `Candle[]`
  - `fetchExchangeInfo()` → `MarketSymbol[]` (USDT SPOT pairs)
- `src/hooks/useKlineData.ts` — combines TanStack Query historical fetch + live stream subscription
  - Deposits history into `useMarketStore.setKlineHistory` on first load
  - Subscribes to `BinanceCryptoSource.subscribeToKlines` for live updates
  - TanStack Query cache: 5min stale time, no window-focus refetch

### Updated
- `src/types/market.ts` — `ConnectionStatus`, `subscribeToKlines` on `MarketDataSource`
- `src/api/market/binance.ts` — full BinanceCryptoSource evolution (kline streams, resubscribeAll, stale guard)
- `src/hooks/usePriceStream.ts` — delta subscription pattern

### Deleted
- `src/stores/prices.ts` — fully removed; all references migrated to `useMarketStore`

### Validated
- `npm run build` — 0 TypeScript errors, 664ms build

---

## [0.3.0] — 2026-05-18 — Phase 2: Live Price Engine

### Added
- `src/api/market/binance.ts` — `BinanceCryptoSource` implementing `MarketDataSource`
  - Combined miniTicker WebSocket stream, single connection, dynamic SUBSCRIBE/UNSUBSCRIBE
  - Exponential backoff reconnection (1s → 30s max)
- `src/lib/formatters.ts` — `formatPrice`, `formatVolume`, `formatChange`, `formatChangeAbs`
- `src/hooks/usePriceStream.ts` — app-level WS subscription management
- `src/components/watchlist/AddSymbolSearch.tsx` — inline coin search (TanStack Query, 1h stale)

### Updated
- `src/App.tsx` — `usePriceStream()` call for app-lifetime WS management
- `src/components/layout/Sidebar.tsx` — live price + 24h change %; hover-to-remove X button
- `src/pages/DashboardPage.tsx` — stat cards (Price, Change 24h, Volume 24h, High/Low)

### Validated
- `npm run build` — 0 TypeScript errors, 1.15s, 308KB JS bundle

---

## [0.2.0] — 2026-05-16 — Infrastructure Stabilization

### Added
- GitHub repository connected (`github.com/Gampunk/MarketPulse`)
- `develop` branch established
- `frontend/vercel.json` — correct Vercel config (framework: vite, SPA rewrite rules)
- Supabase project created, credentials integrated

### Fixed
- Deployment root mismatch, SPA routing in production, environment variable pipeline

---

## [0.1.0] — 2026-05-16 — Phase 1: Project Foundation

### Added
- React 19 + Vite 8 + TypeScript scaffold in `/frontend`
- Tailwind CSS v4, path alias `@/`, shadcn/ui
- Dark trading dashboard theme, layout components, React Router v7, TanStack Query v5
- TypeScript type system, Zustand stores, `npm run build` passing clean

---

## [0.0.1] — 2026-05-16 — Phase 0: Project Initialization

### Added
- Project governance structure (`/system/`, `/docs/`)
- `CLAUDE.md` operational instructions
- Core stack selected and approved
