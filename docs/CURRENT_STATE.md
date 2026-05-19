# CURRENT_STATE.md

**Last Updated:** 2026-05-19
**Current Phase:** Phase 4B — Market Overview + Analytics Layer (COMPLETE — pending commit/push/deploy)
**System State:** BUILDING

---

## Active Focus

Phase 4A (Symbol Metadata Enrichment) and Phase 4B (Market Overview + Analytics Layer) are both runtime-verified locally. All changes are uncommitted. Phase 4B close-out sequence is in progress.

**Git flow rule:** `feature/live-price-engine → develop → (stabilize) → main`. Do NOT merge to `main` until Phase 4 is complete and the develop branch is stable.

**Critical architecture rules (enforced Phase 3B+):**
- Charts are consumers of centralized market state — never owners
- Chart series managed through `useChartEngine` registry — never individual named refs
- CoinGecko is a leaf REST module — never a MarketDataSource, never owns WebSocket
- Metadata flow: CoinGecko REST → hook → `useMarketStore.coinMetadata` → components only
- `coinMetadata` keyed by baseAsset — chart engine has zero knowledge of CoinGecko
- Analytics flow: CoinGecko REST → `useAnalyticsOrchestrator` → `useMarketStore.analytics` → components only
- No component-owned polling — all CoinGecko fetch lifecycle is centralized at AppCore level
- `MarketOverview` wrapped in `React.memo()` — prevents price-tick-driven re-renders

---

## Infrastructure Status

| Service        | Status     | Notes                                                         |
|----------------|------------|---------------------------------------------------------------|
| Git            | DIRTY      | Phase 4A + 4B changes uncommitted (pending close-out commit)  |
| GitHub         | CONNECTED  | `github.com/Gampunk/MarketPulse`                              |
| Vercel         | DEPLOYED   | Phase 4A build live — Phase 4B pending redeploy               |
| Supabase       | CREATED    | Project created, env vars configured — schema pending (Phase 5+) |
| Local dev      | READY      | `.env.local` configured, dev server working, 0 TS errors      |

---

## Branch Status

| Branch                      | State                                        | Remote              |
|-----------------------------|----------------------------------------------|---------------------|
| `main`                      | Infrastructure baseline                      | `origin/main`       |
| `develop`                   | PR #1 open (feature/live-price-engine)       | `origin/develop`    |
| `feature/live-price-engine` | Phase 4A+4B complete, uncommitted changes    | pushed to remote    |

**Next git action:** Commit Phase 4B changes → push `feature/live-price-engine` → update PR #1 → deploy to Vercel production

---

## Deployment Architecture (Current State)

```
Vercel Project
└── Root Directory: frontend/
    ├── vercel.json      ← SPA rewrite rules + Vite framework config
    ├── package.json     ← frontend dependencies
    └── dist/            ← production build output (1.04s, 158.76KB gzipped)
```

---

## What Is Working

- **Git + GitHub:** Repository connected, all branches operational
- **Vercel:** Production + preview deployments functioning
- **Supabase:** Project created, credentials available
- **Local dev server:** `localhost:5173`
- **React + Vite build:** 0 TypeScript errors, 1.04s build, 158.76KB gzipped
- **Dark trading dashboard UI:** Full layout rendered — scrollable with keyboard arrow support
- **Binance WebSocket (singleton):** Persistent connection, SUBSCRIBE/UNSUBSCRIBE protocol
  - One connection handles all ticker + kline streams simultaneously
  - Stale handler guard prevents superseded socket events from acting
  - `ensureConnected()` guards all readyStates including CLOSING (2)
  - Exponential backoff reconnection (1s → 30s max), `resubscribeAll()` on reconnect
- **Sidebar watchlist:** Live price + 24h change % per symbol (green/red), coin logo + name (CoinGecko)
- **DashboardPage stat cards:** Price, Change 24h, Volume 24h, High/Low — live data
- **DashboardPage header:** Coin logo, name, market cap rank badge, symbol + "Real-time market data"
- **Coin search:** Fetches USDT pairs from Binance exchangeInfo, filtered inline search
- **Add to watchlist:** Auto-subscribes new symbol to price stream
- **Remove from watchlist:** Hover X button, auto-unsubscribes price stream
- **Watchlist persistence:** localStorage via Zustand persist middleware
- **TanStack Query:** Symbol list (1h stale), klines (5min stale), metadata (1h stale), analytics (15min stale)
- **Centralized market store (`useMarketStore`):** 6 slices — tickers, klines, symbols, connection, coinMetadata, analytics
  - Redux DevTools integration (dev-only, named 'MarketPulse')
  - `updateKlineCandle` merge engine: live candle replaces last, closed candle appends; 500-candle rolling window
- **Kline REST fetcher (`api/rest/binance.ts`):** Standalone, delegated from BinanceCryptoSource
- **`useKlineData` hook:** Historical REST fetch (TanStack Query) + live stream subscription
- **`PriceChart` component** (`components/charts/PriceChart.tsx`):
  - TradingView Lightweight Charts v5 — candlestick + line chart types
  - `useChartEngine` — series registry (add/remove/get by key), chart lifecycle
  - Volume histogram (HistogramSeries) — directional green/red coloring, isolated price scale
  - Volume axis hidden — value surfaced via crosshair hover tooltip (top-left overlay)
  - `contextRef` tracks `{ symbol, interval, chartType }` — resets on any dimension change
  - `historyReadyRef` gates setData vs. update — prevents live kline before history race
  - Price scale recalibration scoped to symbol change only
- **`TimeframeSelector` component** (`components/charts/TimeframeSelector.tsx`):
  - Button group: 1m | 5m | 15m | 1h | 4h | 1D
- **`ChartTypeSelector` component** (`components/charts/ChartTypeSelector.tsx`):
  - Candles | Line toggle — series swap, no chart recreation; volume persists across switch
- **`useMetadataEnrichment` hook** — AppCore-level, 1h stale, deposits CoinMeta into store
- **`useAnalyticsOrchestrator` hook** — AppCore-level, 15min refresh, parallel useQueries
  - Fetches top-200 by market cap, sorts client-side for gainers/losers (free-tier ordering bug workaround)
  - `lastRefreshedAt` fires only when BOTH analytics queries complete a cycle
- **`MarketOverview` component** (`components/market/MarketOverview.tsx`):
  - `React.memo()` — prevents price-tick re-renders (~1/sec); only re-renders on analytics slice change (~15min)
  - Global stats bar: Market Cap, BTC Dominance, 24h Change — CoinGecko /global
  - Top Gainers / Top Losers tabs — 5 coins each, logo, symbol, name, price, 24h%
  - Relative time display ("Just now" / "X min ago") for last refresh
  - Skeleton loading rows while data is in flight
- **Keyboard scroll:** `tabIndex={-1}` on `<main>` — element focused on click, arrow keys work

---

## What Is Placeholder / Not Yet Built

| Feature                          | Status      | Phase   |
|----------------------------------|-------------|---------|
| Supabase database schema         | NOT CREATED | Phase 5+|
| Vercel Functions / Backend API   | NOT DEPLOYED| Phase 5+|
| WebSocket status indicator (UI)  | NOT BUILT   | Phase 5 |
| React error boundaries           | NOT BUILT   | Phase 5 |
| CI/CD: GitHub Actions            | NOT BUILT   | Phase 5 |

---

## Active Blockers

None.

---

## Next Actions

1. Commit Phase 4B changes — `user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`
2. Push `feature/live-price-engine` to remote
3. Update PR #1 description to cover Phase 4A + 4B
4. Deploy to Vercel production (`vercel --prod` from `frontend/`)
5. Runtime verification on deployed build
6. Evaluate merge into `develop` after stable production observation
7. Evaluate `develop → main` as first stable MVP milestone
8. Begin formal Phase 5 stabilization planning
