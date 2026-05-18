# CURRENT_STATE.md

**Last Updated:** 2026-05-18
**Current Phase:** Phase 3C — Chart System Consolidation (DEFINED — pending Phase 3B commit)
**System State:** BUILDING

---

## Active Focus

Phase 3B is runtime-verified and complete — pending commit + PR to `develop`. Phase 3C is formally defined and begins after Phase 3B administrative close-out.

**Git flow rule:** `feature/live-price-engine → develop → (stabilize) → main`. Do NOT merge to main until chart system consolidation (Phase 3C) is complete and verified.

**Critical architecture rule (enforced Phase 3B+):**
Charts are consumers of centralized market state — never owners. Charts must: subscribe to Zustand store slices only, consume `useKlineData`/store outputs, never fetch from Binance directly, never manage WebSocket lifecycle, never own realtime infrastructure state, never duplicate candle merge logic.

**Phase 3C architecture rule (new):**
Chart series are managed through a `useChartEngine` hook series registry — never via individual named refs. All add/remove/swap operations go through the registry. Future indicator hooks compose with the chart via the engine API — never by reaching into component refs directly.

---

## Infrastructure Status

| Service        | Status     | Notes                                           |
|----------------|------------|-------------------------------------------------|
| Git            | READY      | `feature/live-price-engine` branch, clean build |
| GitHub         | CONNECTED  | `github.com/Gampunk/MarketPulse`                |
| Vercel         | DEPLOYED   | Frontend production + preview deployments live  |
| Supabase       | CREATED    | Project created, env vars configured — schema pending (Phase 4) |
| Local dev      | READY      | `.env.local` configured, dev server working     |

---

## Branch Status

| Branch                      | State                                  | Remote              |
|-----------------------------|----------------------------------------|---------------------|
| `main`                      | Infrastructure baseline                | `origin/main`       |
| `develop`                   | Governance migration merged            | `origin/develop`    |
| `feature/live-price-engine` | Phase 3B in progress                   | pushed to remote    |

**Next git action:** Complete Phase 3B → verify runtime → commit → PR to `develop`

---

## Deployment Architecture (Current State)

```
Vercel Project
└── Root Directory: frontend/
    ├── vercel.json      ← SPA rewrite rules + Vite framework config
    ├── package.json     ← frontend dependencies
    └── dist/            ← production build output (664ms, build-verified)
```

---

## What Is Working

- **Git + GitHub:** Repository connected, all branches operational
- **Vercel:** Production + preview deployments functioning
- **Supabase:** Project created, credentials available
- **Local dev server:** `localhost:5173`
- **React + Vite build:** 0 TypeScript errors, 1.07s build, 152KB gzipped
- **Dark trading dashboard UI:** Full layout rendered
- **Binance WebSocket (singleton):** Persistent connection, SUBSCRIBE/UNSUBSCRIBE protocol
  - One connection handles all ticker + kline streams simultaneously
  - Stale handler guard prevents superseded socket events from acting
  - `ensureConnected()` guards all readyStates including CLOSING (2)
  - Exponential backoff reconnection (1s → 30s max), `resubscribeAll()` on reconnect
- **Sidebar watchlist:** Live price + 24h change % per symbol (green/red)
- **DashboardPage stat cards:** Price, Change 24h, Volume 24h, High/Low — live data
- **Coin search:** Fetches USDT pairs from Binance exchangeInfo, filtered inline search
- **Add to watchlist:** Auto-subscribes new symbol to price stream
- **Remove from watchlist:** Hover X button, auto-unsubscribes price stream
- **Watchlist persistence:** localStorage via Zustand persist middleware
- **TanStack Query:** Symbol list cached for 1 hour (coin search); klines cached 5 min
- **Centralized market store (`useMarketStore`):** 4 slices — tickers, klines, symbols, connection
  - Redux DevTools integration (dev-only, named 'MarketPulse')
  - `updateKlineCandle` merge engine: live candle replaces last, closed candle appends; 500-candle rolling window
- **Kline REST fetcher (`api/rest/binance.ts`):** Standalone, delegated from BinanceCryptoSource
- **`useKlineData` hook:** Historical REST fetch (TanStack Query) + live stream subscription
  - Deposits history into market store on first load
  - Merges live kline updates from WebSocket stream
- **`CandlestickChart` component** (`components/charts/CandlestickChart.tsx`):
  - TradingView Lightweight Charts v5 (`chart.addSeries(CandlestickSeries, ...)`)
  - `autoSize: true` — responsive, fills container without manual ResizeObserver
  - `useKlineData(symbol, interval)` called internally — chart owns its subscription via hook
  - `loadedRef` pattern: `setData` on symbol/interval context change, `series.update` on live tick
  - Dark theme: colors matched to CSS vars in `index.css`
  - `chart.remove()` on unmount — clean teardown, no leaks
- **`TimeframeSelector` component** (`components/charts/TimeframeSelector.tsx`):
  - Button group: 1m | 5m | 15m | 1h | 4h | 1D
  - Active interval highlighted with `--color-accent` (indigo)
- **DashboardPage:** Timeframe state (`useState<Interval>('1m')`), `CandlestickChart` + `TimeframeSelector` wired, stat cards retained

---

## What Is Placeholder / Not Yet Built

| Feature                          | Status      | Phase   |
|----------------------------------|-------------|---------|
| `useChartEngine` hook            | NOT BUILT   | Phase 3C|
| `PriceChart` (multi-series)      | NOT BUILT   | Phase 3C|
| Volume histogram                 | NOT BUILT   | Phase 3C|
| Chart type toggle (Candles/Line) | NOT BUILT   | Phase 3C|
| Indicator/overlay foundation     | NOT BUILT   | Phase 3C|
| Supabase database schema         | NOT CREATED | Phase 4 |
| Vercel Functions / Backend API   | NOT DEPLOYED| Phase 4 |
| Coin metadata (logos, names)     | NOT BUILT   | Phase 4 |
| Market overview panel            | NOT BUILT   | Phase 4 |
| CoinGecko integration            | NOT BUILT   | Phase 4 |
| WebSocket status indicator (UI)  | NOT BUILT   | Phase 5 |

---

## Active Blockers

None.

---

## Next Actions

1. Commit Phase 3B (`user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`) ← immediate
2. Push → PR `feature/live-price-engine` → `develop` ← immediate
3. Begin Phase 3C implementation (see TASKS.md — tasks P3C-A01 through P3C-F)
4. Do NOT merge to `main` until Phase 3C is complete and verified
