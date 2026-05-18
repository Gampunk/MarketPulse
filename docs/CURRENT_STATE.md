# CURRENT_STATE.md

**Last Updated:** 2026-05-18
**Current Phase:** Phase 2 Complete — Transitioning to Phase 3
**System State:** BUILDING

---

## Active Focus

Phase 2 (Live Price Engine) is complete. Binance WebSocket is integrated, live prices flow into the Sidebar and Dashboard, coin search and watchlist management are operational. Transitioning to Phase 3 — Charting (TradingView Lightweight Charts + OHLCV pipeline).

---

## Infrastructure Status

| Service        | Status     | Notes                                           |
|----------------|------------|-------------------------------------------------|
| Git            | READY      | `feature/live-price-engine` branch, clean build |
| GitHub         | CONNECTED  | `github.com/Gampunk/MarketPulse`                |
| Vercel         | DEPLOYED   | Frontend production + preview deployments live  |
| Supabase       | CREATED    | Project created, env vars configured — schema pending (Phase 3) |
| Local dev      | READY      | `.env.local` configured, dev server working     |

---

## Branch Status

| Branch                      | State                          | Remote              |
|-----------------------------|-------------------------------|---------------------|
| `main`                      | Infrastructure baseline        | `origin/main`       |
| `develop`                   | Governance migration merged    | `origin/develop`    |
| `feature/live-price-engine` | Phase 2 complete — pending PR  | not yet pushed      |

**Next git action:** Push `feature/live-price-engine` → PR to `develop` → review → merge → push `develop` → PR to `main`

---

## Deployment Architecture (Current State)

```
Vercel Project
└── Root Directory: frontend/
    ├── vercel.json      ← SPA rewrite rules + Vite framework config
    ├── package.json     ← frontend dependencies
    └── dist/            ← production build output (1.15s, 308KB JS gzipped 97KB)
```

---

## What Is Working

- **Git + GitHub:** Repository connected, all branches operational
- **Vercel:** Production + preview deployments functioning
- **Supabase:** Project created, credentials available
- **Local dev server:** `localhost:5173`
- **React + Vite build:** 0 TypeScript errors, 1.15s build
- **Dark trading dashboard UI:** Full layout rendered
- **Binance WebSocket:** Live prices streaming via `wss://stream.binance.com:9443/stream`
  - Combined miniTicker stream (one connection for all watchlist symbols)
  - Exponential backoff reconnection (1s → 30s max)
- **Sidebar watchlist:** Live price + 24h change % per symbol (green/red)
- **DashboardPage stat cards:** Price, Change 24h, Volume 24h, High/Low — live data
- **Coin search:** Fetches USDT pairs from Binance exchangeInfo, filtered inline search
- **Add to watchlist:** Auto-subscribes new symbol to price stream
- **Remove from watchlist:** Hover X button, auto-unsubscribes price stream
- **Watchlist persistence:** localStorage via Zustand persist middleware
- **TanStack Query:** Symbol list cached for 1 hour (coin search)

---

## What Is Placeholder / Not Yet Built

| Feature                          | Status      | Phase   |
|----------------------------------|-------------|---------|
| TradingView Lightweight Charts   | NOT BUILT   | Phase 3 |
| OHLCV data pipeline              | NOT BUILT   | Phase 3 |
| Supabase database schema         | NOT CREATED | Phase 3 |
| Vercel Functions / Backend API   | NOT DEPLOYED| Phase 3 |
| Coin metadata (logos, names)     | NOT BUILT   | Phase 4 |
| Market overview panel            | NOT BUILT   | Phase 4 |
| CoinGecko integration            | NOT BUILT   | Phase 4 |
| WebSocket status indicator (UI)  | NOT BUILT   | Phase 5 |

---

## Active Blockers

None. Phase 2 is complete. Ready to begin Phase 3.

---

## Next Actions

1. Push `feature/live-price-engine`, open PR to `develop`, merge
2. Merge `develop` → `main` (first stable MVP baseline with live prices)
3. Begin Phase 3 planning session (charting, OHLCV, backend)
