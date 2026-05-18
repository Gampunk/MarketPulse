# CURRENT_STATE.md

**Last Updated:** 2026-05-18
**Current Phase:** Phase 3A Complete — Pending Verification
**System State:** BUILDING

---

## Active Focus

Phase 3A (Centralized Market State Infrastructure) is implemented and build-verified. All source code changes are complete. Awaiting human verification checklist before committing. Phase 3B (chart rendering) must not begin until Phase 3A verification is signed off.

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
| `feature/live-price-engine` | Phase 3A complete — pending commit     | not yet pushed      |

**Next git action:** Verify Phase 3A checklist → commit → push `feature/live-price-engine` → PR to `develop`

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
- **React + Vite build:** 0 TypeScript errors, 664ms build
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
- **Phase 3A verification stub:** DashboardPage shows "1m candles loaded: N" in chart placeholder

---

## What Is Placeholder / Not Yet Built

| Feature                          | Status      | Phase   |
|----------------------------------|-------------|---------|
| TradingView Lightweight Charts   | NOT BUILT   | Phase 3B|
| Timeframe selector UI            | NOT BUILT   | Phase 3C|
| Multiple intervals in store      | NOT BUILT   | Phase 3C|
| Supabase database schema         | NOT CREATED | Phase 4 |
| Vercel Functions / Backend API   | NOT DEPLOYED| Phase 4 |
| Coin metadata (logos, names)     | NOT BUILT   | Phase 4 |
| Market overview panel            | NOT BUILT   | Phase 4 |
| CoinGecko integration            | NOT BUILT   | Phase 4 |
| WebSocket status indicator (UI)  | NOT BUILT   | Phase 5 |

---

## Active Blockers

None. Phase 3A source code complete. Awaiting human verification before commit.

---

## Next Actions

1. **Human:** Run verification checklist (see SESSION_CONTEXT.md Session 004)
2. Commit Phase 3A (`user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`)
3. Push `feature/live-price-engine` → open PR to `develop`
4. Begin Phase 3B planning (TradingView chart component)
