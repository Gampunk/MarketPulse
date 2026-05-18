# ARCHITECTURE.md

**Last Updated:** 2026-05-16
**Status:** APPROVED — Architecture Freeze in effect after Phase 1

---

## System Overview

MarketPulse is a browser-based financial market dashboard providing real-time crypto price monitoring with candlestick/line charting. The architecture follows a hybrid serverless + direct WebSocket pattern.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  Watchlist   │    │   Chart      │    │  Market   │ │
│  │  Component   │    │  Component   │    │ Overview  │ │
│  └──────┬───────┘    └──────┬───────┘    └─────┬─────┘ │
│         │                   │                   │       │
│  ┌──────▼───────────────────▼───────────────────▼─────┐ │
│  │              TanStack Query + Zustand               │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                               │
│          ┌──────────────┼──────────────┐               │
│          ▼              ▼              ▼               │
│   Direct WebSocket    REST API      REST API           │
│   (Live Prices)       (OHLCV)      (Metadata)         │
└───────┬──────────────────┬──────────────┬──────────────┘
        │                  │              │
        ▼                  ▼              ▼
  Binance WSS        Vercel Function   CoinGecko API
  (public, free)     /api/ohlcv        (public, free)
                     [PHASE 3 — not yet active]
                          │
                          ▼
                    Supabase PostgreSQL
                    (OHLCV cache + config)
                    [PHASE 3 — schema not yet created]
                          │
                    (on cache miss)
                          │
                          ▼
                    Binance REST API
                    (public, free)
```

---

## Deployment Architecture (Current State)

```
GitHub (github.com/Gampunk/MarketPulse)
├── main        ← production baseline
└── develop     ← active development

         Git Push → Vercel (auto-deploy)
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         develop push           main push
              │                     │
         Preview Deploy        Production Deploy
         (per-branch URL)      (primary domain)

Vercel Project Configuration:
  Root Directory: frontend/
  Build Command:  npm run build
  Output:         dist/
  Framework:      Vite (auto-detected)

frontend/
├── vercel.json      ← SPA rewrite + Vite config
├── package.json
├── vite.config.ts
└── dist/            ← served as static site
```

**Note:** The `/api/` folder at the project root contains `health.ts` but is NOT currently within the Vercel deployment scope (Vercel root = `frontend/`). Backend functions are deferred. See TD-005.

---

## Deployment Lifecycle

```
Developer writes code on feature branch
        ↓
git push → GitHub
        ↓
Vercel auto-creates Preview deployment
        ↓
Preview URL validated manually
        ↓
PR merged to develop → new Preview deployment
        ↓
develop validated → PR merged to main
        ↓
Production deployment promoted
```

**Rule:** Never push directly to `main` for feature work. All code flows `feature/*` → `develop` → `main`.

---

## Environment Variable Flow

```
Local Development:
  Vite dev server
  reads .env.local at startup
  VITE_* variables → injected into React bundle
  Non-VITE_ variables → server-side only (not exposed)

Cloud (Vercel):
  Vercel reads its own env var store (set in dashboard)
  On each build: VITE_* variables → compiled into static bundle
  Changes to env vars → require full redeploy to take effect
  Non-VITE_ variables → available in Vercel Functions only
```

**Critical Rule:** `VITE_` prefixed variables are baked into the bundle at build time. They are NOT runtime variables. A change to `VITE_SUPABASE_URL` in the Vercel dashboard has no effect until the next deployment.

```
Variable Environments:
┌────────────────────────┬─────────────┬─────────────┐
│ Variable               │ Local       │ Vercel      │
├────────────────────────┼─────────────┼─────────────┤
│ VITE_SUPABASE_URL      │ .env.local  │ Dashboard   │
│ VITE_SUPABASE_ANON_KEY │ .env.local  │ Dashboard   │
│ VITE_API_BASE_URL      │ .env.local  │ Dashboard   │
└────────────────────────┴─────────────┴─────────────┘
```

---

## Layer Definitions

### Frontend (React + Vite + TypeScript)
**Location:** `/frontend/`
**Deploy:** Vercel (static site — root directory: `frontend/`)

Responsibilities:
- All UI rendering
- Direct Binance WebSocket connection (live prices)
- State management via TanStack Query + Zustand
- Chart rendering via TradingView Lightweight Charts
- Watchlist persistence via localStorage

### Backend (Vercel Functions)
**Location:** `/frontend/api/` (planned — Phase 3)
**Current State:** NOT DEPLOYED
**Note:** Currently `/api/` exists at project root but is outside Vercel's deployment scope. Will be moved to `frontend/api/` in Phase 3 when OHLCV caching endpoint is needed.

Responsibilities (Phase 3+):
- OHLCV data caching proxy (Binance REST → Supabase → response)
- Default watchlist configuration endpoint
- Future: alert triggers, user data endpoints

### Database (Supabase PostgreSQL)
**Project:** Supabase free tier — CREATED, credentials configured
**Schema:** NOT YET CREATED

Tables (planned for Phase 3):
- `ohlcv_cache` — cached candlestick data with TTL
- `app_config` — default coin lists, app settings
- `symbols` — supported symbol metadata cache
- Future: `users`, `watchlists`, `alerts`

### Live Data (Binance WebSocket)
**Endpoint:** `wss://stream.binance.com:9443/stream`
**Auth:** None required for public market data
**Status:** NOT YET INTEGRATED (Phase 2)

Stream types to be used:
- `<symbol>@trade` — individual trade ticks (tick-by-tick prices)
- `<symbol>@kline_<interval>` — live OHLCV candles
- `<symbol>@miniTicker` — compact 24h stats (price change %, volume)

Combined stream endpoint supports up to 1024 subscriptions per connection.

### Metadata (CoinGecko API)
**Endpoint:** `https://api.coingecko.com/api/v3`
**Auth:** None required for free tier (rate limit: ~30 req/min)
**Status:** NOT YET INTEGRATED (Phase 4)

---

## Data Abstraction Layer (Critical for Phase 2)

All market data access must go through a typed interface to allow forex integration in a future phase without architecture changes.

```typescript
// frontend/src/types/market.ts — IMPLEMENTED
interface MarketDataSource {
  subscribeToPrice(symbol: string, callback: (price: TickData) => void): () => void;
  fetchOHLCV(symbol: string, interval: Interval, limit: number): Promise<Candle[]>;
  getSupportedSymbols(): Promise<MarketSymbol[]>;
}

// frontend/src/api/market/binance.ts — Phase 2
class BinanceCryptoSource implements MarketDataSource { ... }

// frontend/src/api/market/forex.ts — Future phase
class ForexSource implements MarketDataSource { ... }
```

---

## Frontend Folder Structure

```
frontend/
├── api/               # Vercel Functions (Phase 3 — to be created here)
├── src/
│   ├── api/           # Data fetching + market data sources
│   │   └── market/    # MarketDataSource implementations (Phase 2)
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # shadcn/ui base components
│   │   ├── charts/    # Chart components (Lightweight Charts — Phase 3)
│   │   ├── watchlist/ # Watchlist components (Phase 2)
│   │   └── market/    # Market overview components (Phase 4)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions, formatters
│   │   └── utils.ts   # cn() utility — IMPLEMENTED
│   ├── pages/         # Route-level page components
│   │   └── DashboardPage.tsx  # IMPLEMENTED (placeholder)
│   ├── stores/        # Zustand stores
│   │   ├── watchlist.ts  # IMPLEMENTED (localStorage persist)
│   │   └── prices.ts     # IMPLEMENTED (ready for WS data)
│   └── types/         # TypeScript type definitions
│       └── market.ts  # IMPLEMENTED (all types + interface)
├── public/
├── index.html
├── vite.config.ts     # Tailwind v4 + @/ alias — CONFIGURED
├── vercel.json        # Deployment config — CONFIGURED
├── components.json    # shadcn/ui config — CONFIGURED
└── package.json
```

---

## Chart Engine Architecture (Phase 3C)

The chart rendering layer uses a `useChartEngine` hook as the single point of control for all TradingView series lifecycle operations.

### Data Flow

```
Binance WS → BinanceCryptoSource → useMarketStore → useKlineData hook
                                                            ↓
                                                      PriceChart
                                                            ↓
                                                    useChartEngine
                                                     (series registry)
                                                    ┌──────┴──────┐
                                               'price'        'volume'
                                           CandlestickSeries  HistogramSeries
                                           or LineSeries
```

**Architecture rule:** Chart components are downstream consumers of market state. They never own market infrastructure. `useChartEngine` is chart-layer infrastructure only — it manages TradingView API objects, not market data.

### Series Registry

`useChartEngine` maintains a `Map<string, ISeriesApi<keyof SeriesOptionsMap>>` keyed by string name:

| Key | Series Type | Scale | Pane |
|---|---|---|---|
| `'price'` | `CandlestickSeries` or `LineSeries` | main | 0 |
| `'volume'` | `HistogramSeries` | `priceScaleId: 'volume'` | 0 |
| `'ma20'` (future) | `LineSeries` | main (overlay) | 0 |
| `'rsi'` (future) | `LineSeries` | `priceScaleId: 'rsi'` | 1 |
| `'macd'` (future) | `HistogramSeries` | `priceScaleId: 'macd'` | 2 |

### Pane Convention

- **Pane 0 (main):** Price series, overlay series (MA, Bollinger), volume histogram
- **Pane 1:** Oscillators with their own scale (RSI, Stochastic)
- **Pane 2+:** Secondary oscillators (MACD, others)

Volume histogram uses `priceScaleId: 'volume'` within Pane 0. Scale margins: `{ top: 0.75, bottom: 0 }` — volume occupies the bottom 25% of the main pane without interfering with the price axis.

### `priceScaleId` Convention

| Series | `priceScaleId` | Why |
|---|---|---|
| Price (candlestick/line) | `'right'` (default) | Main price axis — right side |
| Volume histogram | `'volume'` | Independent scale — volume units are not price units |
| MA, Bollinger overlays | `'right'` (same as price) | Overlays share the price axis deliberately |
| RSI | `'rsi'` | 0–100 scale, independent |
| MACD | `'macd'` | Centered at 0, independent |

### Indicator Hook Contract

Future indicator hooks must follow this composition pattern:

```typescript
function useXxxIndicator(
  engine: ChartEngine,    // from useChartEngine
  candles: Candle[],      // from useMarketStore
  options: XxxOptions
): void {
  useEffect(() => {
    if (!engine.isReady || !candles.length) return
    const series = engine.addSeries('xxx', XxxSeriesDefinition, seriesOptions)
    series.setData(mapCandlesToXxx(candles, options))
    return () => engine.removeSeries('xxx')
  }, [engine.isReady, candles, options])
}
```

**Key rules:**
- Indicators call `engine.addSeries()` — never `chartRef.current.addSeries()` directly
- Indicators handle their own data mapping — never modify the market store
- Indicators return cleanup that calls `engine.removeSeries()` — no manual series tracking
- `engine.isReady` guard prevents calls before chart is mounted

### Chart Context Dimensions

`PriceChart` tracks `{ symbol, interval, chartType }` as the full context. Any dimension change triggers series reset:
- **Symbol change:** reset series, reset price scale, call `fitContent()`
- **Interval change:** reset series (different data window), call `fitContent()`
- **Chart type change:** swap price series only, volume series persists, call `fitContent()`

Price scale auto-calibration (`priceScale().applyOptions({ autoScale: true })`) fires only on symbol change — not on interval or chart type change. Interval and chart type changes don't require price axis recalibration because the price range for the same symbol is consistent.

---

## State Management Strategy

| Data Type | Tool | Reason |
|---|---|---|
| OHLCV / REST data | TanStack Query | Built-in caching, background refresh, loading states |
| Live WebSocket prices | Zustand store | Reactive, low overhead, updated by WS message handler |
| Active symbol | Zustand store | Shared across chart + watchlist components |
| Watchlist items | Zustand + localStorage | Client-side persistence, no backend needed for MVP |
| UI state (sidebar, theme) | Zustand store | Simple client state |

---

## Architecture Freeze Policy

The following MUST NOT change without tradeoff analysis and migration planning:
- Frontend framework: **React + Vite**
- Charting library: **TradingView Lightweight Charts**
- State management: **TanStack Query + Zustand**
- Styling: **Tailwind CSS + shadcn/ui**
- Backend runtime: **Vercel Functions (Node.js)**
- Database: **Supabase PostgreSQL**
- Deployment: **Vercel**
- Live data source: **Binance WebSocket API**
- Git flow: **feature/* → develop → main**

---

## Scalability Path

| Phase | Scaling Action |
|---|---|
| MVP | Fully free tier — direct browser WebSocket, Vercel static, Supabase free |
| Growth | Move backend functions into deployment scope, add server-side WS relay (Fly.io or Railway) |
| Scale | Add Redis cache (Upstash), CDN for static assets, rate limit management |
| Enterprise | Multi-region deployment, dedicated database, observability stack |
