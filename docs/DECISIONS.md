# DECISIONS.md

**Last Updated:** 2026-05-18

Architecture decisions log. Changes to these decisions require tradeoff analysis and migration planning.

---

## DEC-001 — Frontend Framework: React + Vite + TypeScript

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Use React 19 + Vite + TypeScript as the frontend stack.

**Alternatives Considered:**
- Next.js: SSR/SSG is unnecessary overhead for a real-time client-side dashboard
- Vue 3: Good option but smaller ecosystem for financial UI libraries
- Svelte: Excellent performance but limited financial charting library support

**Rationale:**
- TradingView Lightweight Charts has first-class React bindings
- TanStack Query and Zustand are React-native
- shadcn/ui is React-native
- Largest ecosystem for financial dashboard use cases
- Vite provides fastest dev experience for this project type

**Decision Confidence:** HIGH

---

## DEC-002 — Charting Library: TradingView Lightweight Charts v5

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Use TradingView Lightweight Charts for all financial charting.

**Alternatives Considered:**
- Recharts: General-purpose D3 wrapper, not optimized for financial charts
- Chart.js + financial plugin: Limited candlestick support, not WebGL-accelerated
- Highcharts Stock: Powerful but paid license for commercial use
- Apache ECharts: Good alternative but heavier bundle, less financial-specialized

**Rationale:**
- Purpose-built for financial charts (candlestick, OHLCV, area, bar)
- WebGL-accelerated — handles tick-by-tick re-renders without frame drops
- ~40KB gzipped — smallest serious financial chart library
- Native TypeScript support
- Free and open source (Apache 2.0)
- Used in production by major trading platforms

**Decision Confidence:** HIGH

---

## DEC-003 — State Management: TanStack Query + Zustand

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Use TanStack Query v5 for server state + Zustand v5 for client state.

**Alternatives Considered:**
- Redux Toolkit: Powerful but excessive boilerplate for MVP
- Jotai: Good but less proven for complex async patterns
- SWR: Good but TanStack Query is more feature-rich
- React Context: Performance bottleneck for frequent price updates

**Rationale:**
- TanStack Query handles all REST/async data with built-in caching, background refresh, loading states
- Zustand is ideal for WebSocket price streams (minimal re-render overhead)
- The two libraries compose without conflict
- Both have excellent TypeScript support

**Decision Confidence:** HIGH

---

## DEC-004 — Styling: Tailwind CSS v4 + shadcn/ui

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Tailwind CSS v4 + shadcn/ui for all styling and UI components.

**Alternatives Considered:**
- Material UI: Heavy bundle, opinionated design system
- Chakra UI: Good alternative but heavier than Tailwind
- Ant Design: Enterprise-oriented, heavy

**Rationale:**
- Tailwind: Fastest iteration speed, excellent dark mode support (critical for trading UIs)
- shadcn/ui: Accessible, unstyled primitives with copy-paste ownership (no lock-in)
- Combined: Production-quality component quality at MVP speed
- Dark mode is first-class — trading dashboards are primarily dark

**Decision Confidence:** HIGH

---

## DEC-005 — Backend: Vercel Functions (Serverless Node.js)

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Use Vercel Functions (serverless) as the backend layer.

**Alternatives Considered:**
- Express/Fastify on persistent server: Requires always-on hosting (not sustainably free)
- Next.js API routes: Overkill — adds Next.js dependency for functions only
- Cloudflare Workers: Excellent but vendor lock-in, different paradigm

**Rationale:**
- Fully free on Vercel's tier for API volumes at MVP scale
- Co-deployed with frontend — single deployment pipeline
- Sufficient for REST endpoints (OHLCV cache proxy, config, future user data)
- No persistent connection needed — browser handles live WebSocket directly

**Tradeoff:** Cannot maintain persistent WebSocket connections server-side. Accepted — live prices go directly from browser to Binance WebSocket.

**Decision Confidence:** HIGH

---

## DEC-006 — Database: Supabase PostgreSQL

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Use Supabase PostgreSQL as the project database.

**Alternatives Considered:**
- PlanetScale (MySQL): Deprecated free tier — not viable
- Neon (serverless PG): Good alternative, similar to Supabase
- MongoDB Atlas: Document store — unnecessary for structured market data
- SQLite (local): Not suitable for serverless functions

**Rationale:**
- Free tier: 500MB storage, 5GB bandwidth — adequate for OHLCV cache + config
- PostgreSQL is well-understood and scalable
- Supabase adds real-time subscriptions and Auth if needed later
- Direct integration with Vercel Functions via Supabase JS client

**Decision Confidence:** HIGH

---

## DEC-007 — Live Price Source: Binance WebSocket (Direct Browser Connection)

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Browser connects directly to Binance public WebSocket streams for live prices.

**Alternatives Considered:**
- Server-side WS relay: Requires persistent always-on server — not free tier compatible
- Polling (REST): Too slow for tick-by-tick (<1s) requirement
- Coinbase WebSocket: Alternative source, similar capability

**Rationale:**
- Binance WebSocket supports CORS for browser connections on public market data
- No API key required for public market data streams
- Combined streams support 1024+ subscriptions per connection
- Tick-by-tick latency (<1s) requirement is met
- Pattern used by major crypto dashboards (Coinglass, Messari, etc.)

**Decision Confidence:** HIGH

---

## DEC-008 — Deployment: Vercel

**Date:** 2026-05-16
**Status:** APPROVED — FROZEN

**Decision:** Deploy to Vercel (frontend + Vercel Functions).

**Rationale:**
- Free tier: 100GB bandwidth, adequate for MVP
- Zero-config Vite integration
- Vercel Functions co-deployed alongside frontend
- Automatic preview deployments per PR
- Excellent DX for solo/small team projects

**Decision Confidence:** HIGH

---

## DEC-009 — No User Authentication for MVP

**Date:** 2026-05-16
**Status:** APPROVED

**Decision:** No auth system in MVP. Watchlists stored in browser localStorage.

**Rationale:**
- Reduces MVP scope significantly
- No auth backend required
- localStorage sufficient for single-device watchlist
- Database schema will be designed to support future auth (Supabase Auth)

**Future:** Supabase Auth can be added in a later phase if monetization or cross-device sync is needed.

**Decision Confidence:** HIGH

---

## DEC-010 — Crypto-First, Forex in Phase 2

**Date:** 2026-05-16
**Status:** APPROVED

**Decision:** MVP covers crypto only. Forex added in a future phase.

**Rationale:**
- Binance provides the best free-tier WebSocket and REST data for crypto
- Forex free-tier APIs are more limited and fragmented
- Data abstraction layer (MarketDataSource interface) will be designed from day one to allow clean forex integration

**Decision Confidence:** HIGH

---

## DEC-011 — Vercel Deployment Root: `frontend/`

**Date:** 2026-05-16
**Status:** APPROVED — ACTIVE

**Decision:** Set Vercel's "Root Directory" project setting to `frontend/`. Place `vercel.json` inside `frontend/` with framework-relative paths.

**Context:** The project uses a monorepo-style layout with `/frontend` containing the React app and `/api` containing the planned backend. During initial deployment, placing `vercel.json` at the repo root with `cd frontend && npm run build` caused path resolution issues and nested directory errors.

**Rationale:**
- `vercel.json` placed inside the Root Directory removes all path ambiguity
- Build commands (`npm run build`) run correctly relative to `frontend/`
- Output directory (`dist`) is correctly resolved
- Simpler, more idiomatic Vite + Vercel deployment pattern
- Vercel auto-detects the Vite framework when the framework is at the root

**Tradeoff:** The `/api/` folder at the project root is now outside the Vercel deployment scope. Backend functions must be relocated to `frontend/api/` when needed (Phase 3).

**Decision Confidence:** HIGH

---

## DEC-012 — Backend API Deployment Deferred to Phase 3

**Date:** 2026-05-16
**Status:** APPROVED

**Decision:** Backend Vercel Functions (`/api/health.ts`) are not deployed in Phase 1. Backend integration is deferred until Phase 3 when the OHLCV caching endpoint is actually required.

**Rationale:**
- Phase 1 and Phase 2 (live price engine) require no backend — Binance WebSocket is a direct browser connection
- Deploying an unneeded backend layer prematurely adds complexity and risk
- The Supabase project is created and credentials are configured — the DB layer is ready when needed
- Relocating `/api/` inside `frontend/api/` will be done in Phase 3 as a clean, intentional step

**Accepted Risk:** The root-level `/api/health.ts` is dead code until relocation. Tracked in Tech Debt as TD-005.

**Decision Confidence:** HIGH

---

## DEC-013 — Preview Deployments Validated Before Production Promotion

**Date:** 2026-05-16
**Status:** APPROVED — OPERATIONAL POLICY

**Decision:** All feature work is validated on preview deployments (from `develop` branch) before merging to `main` (production).

**Rationale:**
- Vercel automatically generates preview URLs for every push to non-production branches
- Preview validation catches deployment-specific issues (env var injection, routing, build errors) that local testing cannot catch
- `main` must remain the stable, production-quality branch
- This mirrors industry-standard GitFlow validation practices

**Git Flow:**
```
feature/* → develop (preview deploy) → main (production deploy)
```

**Decision Confidence:** HIGH

---

## DEC-014 — VITE_ Prefix Required for Client-Side Environment Variables

**Date:** 2026-05-16
**Status:** APPROVED — OPERATIONAL POLICY

**Decision:** All environment variables that need to be accessible in the React browser bundle must use the `VITE_` prefix. Variables without this prefix are server-side only.

**Context:** Initial deployment revealed that Supabase credentials were not available in the browser despite being set in Vercel's environment variable dashboard. The `VITE_` prefix was missing.

**Rationale:**
- Vite's security model explicitly requires `VITE_` prefix to prevent accidental exposure of server secrets to the client bundle
- Variables are compiled into the static bundle at build time — they are NOT runtime-injectable
- Any change to `VITE_*` variables in Vercel requires a new deployment to take effect

**Operational Rule:**
- Client-accessible variables → `VITE_VARIABLE_NAME` (in `.env.local` and Vercel dashboard)
- Server-only variables (future Vercel Functions) → `VARIABLE_NAME` (no prefix, not exposed to browser)

**Decision Confidence:** HIGH

---

## DEC-015 — MarketDataSource Interface Expansion: subscribeToKlines

**Date:** 2026-05-18
**Status:** APPROVED — ACTIVE

**Decision:** Expand the `MarketDataSource` interface to include `subscribeToKlines(symbol, interval, callback): () => void` as a first-class method.

**Context:** Phase 3A requires live kline (candlestick) streams alongside ticker streams. The existing interface only covered `subscribeToPrice` and REST methods.

**Alternatives Considered:**
- Separate KlineDataSource interface: Creates unnecessary fragmentation — a single source handles both ticker and kline streams on the same WebSocket connection
- Component-level WebSocket: Violates governance rule that UI components must never own market infrastructure

**Rationale:**
- A single connection naturally multiplexes ticker + kline streams — they belong in one interface
- The interface abstraction is preserved; a Coinbase or Kraken source can implement the same contract
- Avoids proliferating per-symbol WebSocket connections

**Governance Rule:** UI components must never own market infrastructure. Components consume store slices only. All stream logic lives in BinanceCryptoSource.

**Decision Confidence:** HIGH

---

## DEC-016 — Centralized Market Store: useMarketStore Replaces usePricesStore

**Date:** 2026-05-18
**Status:** APPROVED — ACTIVE

**Decision:** Replace the lightweight `usePricesStore` with a centralized `useMarketStore` (Zustand v5) containing four slices: `tickers`, `klines`, `symbols`, and `connection`.

**Context:** Phase 3A adds kline state and connection observability. `usePricesStore` only held ticker prices and was not extensible to klines without coupling concerns.

**Alternatives Considered:**
- Extend usePricesStore in-place: The slice structure becomes unclear and the store name misleads about its scope
- Separate klineStore + pricesStore: Dual stores for the same WebSocket data source creates synchronization risk

**Rationale:**
- One store per data domain (market data = one domain)
- `tickers`, `klines`, `symbols`, `connection` are all market-data concerns — cohesion is clean
- Redux DevTools integration (dev-only) provides full timeline replay of all market state changes
- `updateKlineCandle` merge engine lives in the store — components are never responsible for merge logic
- Rolling 500-candle window enforced in the store, not in hooks or components

**Migration:** `usePricesStore` deleted (`stores/prices.ts` removed). All references updated to `useMarketStore`.

**Decision Confidence:** HIGH

---

## DEC-017 — OHLCV Source: Browser-Direct Binance REST (Supabase Caching Deferred to Phase 4)

**Date:** 2026-05-18
**Status:** APPROVED — ACTIVE

**Decision:** Historical kline data (OHLCV) fetched directly from `https://api.binance.com/api/v3/klines` in the browser. Supabase caching via Vercel Functions is deferred to Phase 4.

**Context:** Phase 3 originally planned a Vercel Function → Supabase cache layer for OHLCV. Architecture review concluded this adds infrastructure complexity with no user-facing benefit during MVP.

**Alternatives Considered:**
- Vercel Function proxy + Supabase cache: Reduces repeated Binance API calls but requires deploying backend functions, setting up DB schema, and managing cache invalidation — all before any chart renders
- Server-side WebSocket relay: Not viable on Vercel serverless (no persistent connections)

**Rationale:**
- Binance REST is public, no API key required, rate limits are generous at MVP traffic
- TanStack Query provides client-side caching (5min stale time) — most repeat fetches are free
- Deploying backend infra before the chart even renders inverts the build order (infrastructure before feature)
- The REST layer (`api/rest/binance.ts`) is already abstracted — Vercel Function proxy can be dropped in as a swap in Phase 4 without touching hooks or components

**Accepted Risk:** Rate limiting if many users repeatedly switch timeframes rapidly. Acceptable at MVP scale.

**Decision Confidence:** HIGH

---

## DEC-018 — Chart Engine Architecture: `useChartEngine` Hook + Series Registry

**Date:** 2026-05-18
**Status:** APPROVED — ACTIVE (Phase 3C)

**Decision:** Extract chart infrastructure into a `useChartEngine` hook that owns the chart instance lifecycle and a named series registry (`Map<string, ISeriesApi>`). The chart component (`PriceChart`) uses this hook for all series operations. Future indicator hooks compose with the chart via the engine API.

**Context:** Phase 3B delivered a working `CandlestickChart` with one hard-coded `CandlestickSeries` ref. Phase 3C requires: volume histogram (second series), chart type switching (candlestick ↔ line, requiring series swap), and a foundation for future indicator hooks (RSI, MACD, Bollinger). The single-ref model cannot support this cleanly.

**Alternatives Considered:**
- **Extend `CandlestickChart` with additional named refs:** `volumeSeriesRef`, `lineSeriesRef`, etc. — ref proliferation; no structured teardown; doesn't scale to overlays; no composition contract for future hooks.
- **React context for chart instance (child composition model):** `<Chart>` renders canvas, child components register series via context. Most extensible but requires component tree restructuring and context overhead — appropriate for Phase 10 advanced charting, not Phase 3C.
- **Series management inline in component with a registry ref:** Correct pattern but better encapsulated in a hook for reuse and testability.

**Rationale:**
- A hook encapsulates the registry without changing the component API surface
- `addSeries(key, definition, options)` with implicit replace-if-exists is the correct primitive for chart type switching — one call handles the swap cleanly
- `clearAllSeries()` gives future indicator hooks a safe teardown path on context reset
- Future `useXxxIndicator(engine, candles, options)` hooks compose without touching the chart component — the engine API is the stable contract
- `isReady` guard prevents series operations before the chart is mounted — eliminates a class of timing bugs

**Governance Rule:** Indicator hooks must use `engine.addSeries()` — never `chartRef.current.addSeries()` directly. This ensures all series are tracked in the registry and cleaned up correctly.

**Decision Confidence:** HIGH

---

## DEC-019 — Metadata Architecture: `coinMetadata` Slice + CoinGecko as Leaf Module

**Date:** 2026-05-18
**Status:** APPROVED — ACTIVE (Phase 4A)

**Decision:** CoinGecko coin metadata is stored in a dedicated `coinMetadata: Record<string, CoinMeta>` slice in `useMarketStore`, keyed by `baseAsset` uppercase (e.g., `"BTC"`). CoinGecko is implemented as a leaf REST module (`api/rest/coingecko.ts`) — not a `MarketDataSource` implementation and never owns a WebSocket. Metadata is deposited via `useMetadataEnrichment` hook called from `App.tsx`.

**Context:** Phase 4A introduces CoinGecko coin logos, names, and market cap ranks. The key architectural question was where this data lives and how components access it.

**Alternatives Considered:**
- **Enrich existing `symbols` slice** (`setSymbols()` with CoinGecko data): Risk of merge conflict with Binance exchange info; namespace mismatch (CoinGecko coins vs. Binance pairs); `setSymbols()` replaces atomically — partial enrichment would overwrite other data.
- **Component-level CoinGecko fetch** (each component fetches its own metadata): Violates centralized market ownership rule; N API calls instead of 1; cache fragmented per component.
- **Separate `coinMetadata` Zustand store** (outside `useMarketStore`): Proliferates stores for the same data domain; market data is one domain.

**Rationale:**
- `coinMetadata` is market data (metadata about coins) — belongs in `useMarketStore` alongside tickers, klines, symbols
- Keyed by `baseAsset` (not Binance pair) because CoinGecko is coin-centric, not pair-centric — a BTC entry covers BTCUSDT, BTCBUSD, BTCEUR without duplication
- CoinGecko as a leaf module preserves `MarketDataSource` abstraction — CoinGecko is metadata, not a stream source
- `useMetadataEnrichment` at app root follows the same side-effect hook pattern as `useKlineData` — deposit into store, return nothing, consumers read from store
- Market overview data (top movers, global stats) lives in TanStack Query cache — it's server state that refreshes periodically, not push data

**Constraints:**
- `getCoinMeta(binanceSymbol)` strips "USDT" suffix to derive baseAsset — correct for all current pairs (USDT-only watchlist). Must not be extended to non-USDT pairs without revisiting (TD-016).
- Chart engine must remain ignorant of `coinMetadata` — metadata enrichment and chart rendering are decoupled concerns.

**Decision Confidence:** HIGH
