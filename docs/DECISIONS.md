# DECISIONS.md

**Last Updated:** 2026-05-16

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
