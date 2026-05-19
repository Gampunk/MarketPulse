# TASKS.md

**Last Updated:** 2026-05-19
**Current Phase:** Phase 4B — Market Overview + Analytics Layer (COMPLETE — close-out in progress)

---

## Active Tasks (Phase 4B Close-Out)

- [ ] P4B-CMT: Commit Phase 4A + 4B (`user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`)
- [ ] P4B-PUSH: Push `feature/live-price-engine` to remote
- [ ] P4B-PR: Update PR #1 description to cover Phase 4A + 4B
- [ ] P4B-DEPLOY: Deploy to Vercel production (`vercel --prod` from `frontend/`)
- [ ] P4B-VERCEL-VER: Deployed runtime verification (analytics panel, gainers/losers, CoinGecko cadence, chart stability, WS integrity, mobile responsiveness)

---

## Completed Tasks (Phase 4B — Market Overview + Analytics Layer)

### 4B-000 — Architecture Assessment (completed before implementation)
- [x] P4B-ASSESS: Formal analytics orchestration architecture assessment — Orchestrator Pattern approved (DEC-020)

### 4B-001 — Analytics Store Slice
- [x] P4B-001: Add `analytics` slice to `useMarketStore`
  - `{ topGainers, topLosers, globalStats, lastRefreshedAt }`
  - `setTopGainers`, `setTopLosers`, `setGlobalStats`, `setAnalyticsLastRefreshed` — all with devtools action names

### 4B-002 — CoinGecko Analytics Client
- [x] P4B-002: Add `fetchGlobalStats()` to `api/rest/coingecko.ts`
- [x] P4B-003: Add `fetchMarketMovers(universeSize, topN)` to `api/rest/coingecko.ts`
  - Replaced broken `fetchTopGainers` + `fetchTopLosers` with single broader fetch + client-side sort
  - Root cause: CoinGecko free tier silently ignores `order=price_change_*` params
  - Fix: fetch top-200 by market cap, filter `changePct24h > 0 / < 0`, sort client-side, slice top N

### 4B-003 — Analytics Orchestrator Hook
- [x] P4B-004: Create `frontend/src/hooks/useAnalyticsOrchestrator.ts`
  - `ANALYTICS_REFRESH_MS = 15 * 60 * 1000` — defined once, no magic literals
  - Parallel `useQueries` — market-movers query + global-stats query
  - `lastRefreshedAt` via `useEffect` watching `dataUpdatedAt` from both — fires only when BOTH complete
  - `refetchOnWindowFocus: false` on all queries
- [x] P4B-005: Register `useAnalyticsOrchestrator()` in `AppCore` (`App.tsx`)

### 4B-004 — MarketOverview Component
- [x] P4B-006: Create `frontend/src/components/market/MarketOverview.tsx`
  - `memo()` wrapper — prevents price-tick re-renders
  - Global stats bar (Market Cap, BTC Dom., 24h Change) + relative time display
  - Top Gainers / Top Losers tabs — MoverRow (logo, symbol, name, price, 24h%)
  - Skeleton loading rows when data is in flight
- [x] P4B-007: Import and render `<MarketOverview />` in `DashboardPage.tsx`

### 4B-005 — Layout + UX Fixes
- [x] P4B-008: Fix page scrollability — remove `h-full` from DashboardPage outer div
- [x] P4B-009: Responsive chart height — `h-[clamp(300px,45vh,560px)]`
- [x] P4B-010: Keyboard scroll — `tabIndex={-1}` + `outline-none` on `<main>` in AppLayout
- [x] P4B-011: Volume axis hidden — `visible: false, borderVisible: false` in `VOLUME_SCALE_OPTIONS`
- [x] P4B-012: Volume crosshair tooltip — `subscribeCrosshairMove` handler, absolute-positioned overlay in PriceChart
- [x] P4B-013: `formatVolume` trillion case — global market cap display

### 4B-006 — Validation
- [x] P4B-014: `npm run build` → 0 TypeScript errors (1.04s, 158.76KB gzipped)
- [x] P4B-VER: Human runtime verification — 3 screenshot sessions confirming all features

---

## Completed Tasks (Phase 4A — Symbol Metadata Enrichment)

### 4A-001 — Type Foundation
- [x] P4A-001: Create `frontend/src/types/metadata.ts`
  - `CoinMeta` — `{ id, symbol, name, logoUrl, marketCapRank }`
  - `GlobalMarketStats` — `{ totalMarketCapUsd, btcDominancePct, marketCapChange24hPct }`
  - `TopMoverCoin` — `{ id, symbol, name, logoUrl, marketCapRank, changePct24h, priceUsd }`

### 4A-002 — CoinGecko REST Client
- [x] P4A-002: Create `frontend/src/api/rest/coingecko.ts`
  - `fetchCoinMetadata()` — top 100 coins by market cap
  - `fetchGlobalStats()` — `/global` endpoint
  - Pattern: module-level `REST_BASE`, standalone functions, no class

### 4A-003 — Store Enrichment
- [x] P4A-003: Add `coinMetadata` slice to `useMarketStore`
  - Keyed by `symbol.toUpperCase()` ("BTC")
  - `setCoinMetadata`, `getCoinMeta` implemented

### 4A-004 — Metadata Enrichment Hook
- [x] P4A-004: Create `frontend/src/hooks/useMetadataEnrichment.ts`
  - TanStack Query, `staleTime: 60 * 60 * 1000`, side-effect hook
- [x] P4A-005: `AppCore` pattern in `App.tsx` — `useMetadataEnrichment()` runs inside `QueryClientProvider`

### 4A-005 — UI Enrichment
- [x] P4A-006: `Sidebar.tsx` — `CoinIcon` component (logo img + TrendingUp fallback), coin name secondary text
- [x] P4A-007: `DashboardPage.tsx` — header: logo, coin name, rank badge, subtitle

### 4A-006 — Validation
- [x] P4A-008: `npm run build` → 0 TypeScript errors (720ms, 156KB gzipped)
- [x] P4A-VER: Human runtime verification — logos, name + rank in header, fallback works

---

## Completed Tasks (Phase 3C)

- [x] P3C-VER: Human runtime verification — line chart, volume histogram, chart type toggle, volume persistence, symbol switch, interval switch, live updates, singleton WS preserved
- [x] P3C-CMT: Committed (`55225dc`) — `user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`
- [x] P3C-PR: Pushed — included in PR #1 (`feature/live-price-engine → develop`)
- [x] P3C-A01 through P3C-E04: All Phase 3C tasks complete (see previous TASKS.md for full list)

---

## Completed Tasks (Phase 3B)

- [x] P3B-VER: Human runtime verification — chart renders live, symbol switch works, no loop
- [x] P3B-001 through P3B-009: All Phase 3B tasks + bug fixes complete

---

## Completed Tasks (Phase 3A)

- [x] P3A-001 through P3A-007: All Phase 3A tasks complete, committed (`aa94f7a`)

---

## Completed Tasks (Phase 2)

- [x] P2-001 through P2-005: All Phase 2 tasks complete

---

## Completed Tasks (Phase 1 / 1.5)

- [x] P1-001 through P1-016: Full scaffold complete
- [x] UA-001 through UA-003: GitHub, Supabase, Vercel infrastructure complete
