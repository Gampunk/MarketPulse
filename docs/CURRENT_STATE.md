# CURRENT_STATE.md

**Last Updated:** 2026-05-16
**Current Phase:** Phase 1 Complete — Infrastructure Stabilized — Transitioning to Phase 2
**System State:** STABILIZATION → BUILDING

---

## Active Focus

Infrastructure stabilization phase complete. Git, GitHub, Vercel, and Supabase are all operational. Production and preview deployments are working. Transitioning to Phase 2 — Live Price Engine (Binance WebSocket integration).

---

## Infrastructure Status

| Service        | Status     | Notes                                           |
|----------------|------------|-------------------------------------------------|
| Git            | READY      | Initialized, main + develop branches            |
| GitHub         | CONNECTED  | `github.com/Gampunk/MarketPulse`                |
| Vercel         | DEPLOYED   | Frontend production + preview deployments live  |
| Supabase       | CREATED    | Project created, env vars configured            |
| Local dev      | READY      | `.env.local` configured, dev server working     |

---

## Branch Status

| Branch    | State                          | Remote           |
|-----------|-------------------------------|------------------|
| `main`    | Production baseline (initial)  | `origin/main`    |
| `develop` | Active — deployment fix merged | `origin/develop` |

**Current branch:** `develop`

**Note:** The deployment stabilization commit (vercel.json placement fix, env vars) is on `develop` and has NOT been merged to `main` yet. `main` still has the original pre-deployment config. The next logical step is to merge `develop` → `main` after Phase 2 work begins.

---

## Deployment Architecture (Current State)

```
Vercel Project
└── Root Directory: frontend/
    ├── vercel.json      ← SPA rewrite rules + Vite framework config
    ├── package.json     ← frontend dependencies
    └── dist/            ← production build output
```

- **Vercel root directory:** `frontend/` (set in Vercel project settings)
- **Build command:** `npm run build` (runs from `frontend/`)
- **Output directory:** `dist`
- **Framework:** Vite (auto-detected by Vercel)
- **API functions:** NOT currently deployed (backend deferred — see Tech Debt TD-005)

---

## Environment Variables

| Variable              | Local (`.env.local`) | Vercel (dashboard) | Purpose                  |
|-----------------------|----------------------|--------------------|--------------------------|
| `VITE_SUPABASE_URL`   | ✅ Set               | ✅ Set             | Supabase project URL     |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set            | ✅ Set             | Supabase anon/public key |
| `VITE_API_BASE_URL`   | Empty (local)        | Empty (Vercel)     | Reserved for future use  |

All `VITE_` prefixed variables are baked into the static bundle at **build time** by Vite. They are NOT runtime environment variables.

---

## What Is Working

- **Git + GitHub:** Repository connected, main + develop branches, pushes working
- **Vercel:** Production + preview deployments functioning
  - Frontend static site served correctly
  - SPA routing (React Router) working via catch-all rewrite
- **Supabase:** Project created, credentials available locally and in Vercel
- **Local dev server:** `localhost:5173` — 473ms cold start
- **React + Vite:** TypeScript passes clean — 0 errors, 715ms build
- **Dark trading dashboard UI:** AppLayout, TopBar, Sidebar, DashboardPage rendered
- **Zustand stores:** WatchlistStore (localStorage) + PricesStore scaffolded
- **MarketDataSource interface:** Defined and ready for implementation
- **React Router v7:** SPA routing working in both local and production
- **TanStack Query v5:** QueryClient configured

---

## What Is Placeholder / Not Yet Built

| Feature                          | Status      | Phase   |
|----------------------------------|-------------|---------|
| Binance WebSocket integration    | NOT BUILT   | Phase 2 |
| Live price display (Sidebar)     | PLACEHOLDER | Phase 2 |
| Coin search + watchlist edit     | NOT BUILT   | Phase 2 |
| TradingView Lightweight Charts   | NOT BUILT   | Phase 3 |
| OHLCV data pipeline              | NOT BUILT   | Phase 3 |
| Supabase database schema         | NOT CREATED | Phase 3 |
| Vercel Functions / Backend API   | NOT DEPLOYED| Phase 3 |
| CoinGecko metadata integration   | NOT BUILT   | Phase 4 |
| Market overview panel            | NOT BUILT   | Phase 4 |

---

## Active Blockers

None. Infrastructure is stable. Ready to begin Phase 2 implementation.

---

## Next Actions

### Immediate (before next feature session)
1. Merge `develop` → `main` (infrastructure stabilization commit)
2. Create `feature/live-price-engine` branch off `develop`

### Phase 2 Implementation
1. Implement `BinanceCryptoSource` in `frontend/src/api/market/binance.ts`
2. Wire live prices into `PricesStore`
3. Display live prices in `Sidebar` watchlist rows
4. Display price stats in `DashboardPage` stat cards
5. Implement coin search + add-to-watchlist
