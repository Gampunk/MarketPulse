# ROADMAP.md

**Last Updated:** 2026-05-19
**Vision:** Browser-based financial market dashboard providing real-time crypto and forex market visibility through clean visual analytics and responsive user experience.

---

## MVP Goal

Ship a production-quality crypto market dashboard with:
- Live price watchlist (tick-by-tick, <1s updates)
- Candlestick + line charts with OHLCV data and volume histogram
- Market overview (gainers/losers, global stats)
- Dark mode, desktop-first UX
- Deployed on Vercel, backed by Supabase

**MVP Status:** Core feature set complete (Phases 1–4). Phase 5 stabilization required before MVP release tag.

---

## Phase Timeline

### Phase 0 — Project Initialization ✅ COMPLETE
**Completed:** 2026-05-16

### Phase 1 — Project Foundation ✅ COMPLETE
**Completed:** 2026-05-16
- React 19 + Vite + TypeScript + Tailwind v4 scaffold
- Base layout, routing, type system, Zustand stores

### Phase 1.5 — Infrastructure Stabilization ✅ COMPLETE
**Completed:** 2026-05-16
- GitHub, Vercel, Supabase connected and operational

### Phase 2 — Live Price Engine ✅ COMPLETE
**Completed:** 2026-05-18
- Binance WebSocket singleton — tick-by-tick prices
- Sidebar watchlist — live price + 24h change %
- Coin search + add/remove from watchlist
- WebSocket reconnection with exponential backoff

### Phase 3 — Charting ✅ COMPLETE
**Completed:** 2026-05-18
- Phase 3A: Centralized market store (`useMarketStore`) — klines, tickers, merge engine
- Phase 3B: TradingView Lightweight Charts v5 — candlestick, live updates
- Phase 3C: `useChartEngine` — series registry, PriceChart (multi-type), volume histogram, chart type toggle

### Phase 4 — Market Intelligence + Analytics Ecosystem ✅ COMPLETE
**Completed:** 2026-05-19
- Phase 4A: CoinGecko metadata — coin logos, names, market cap ranks in sidebar + header
- Phase 4B: Analytics orchestrator — top gainers/losers, global market stats, 15min refresh
  - `MarketOverview` component — memo-wrapped, zero price-tick re-renders
  - Volume crosshair tooltip (bubble overlay replacing persistent axis label)
  - Scrollable layout with responsive chart height

### Phase 5 — Stabilization + Production Hardening 🔄 NEXT
**Status:** PENDING — begins after Phase 4 close-out and develop merge

**Scope:**
- WebSocket reconnection UI indicator (status badge in TopBar)
- React error boundaries (chart, market overview, sidebar)
- CI/CD: GitHub Actions (TypeScript check + ESLint + build gate on PR)
- Technical debt cleanup:
  - TD-003: Vercel Functions not used (backend scaffolding unused)
  - TD-004: Supabase credentials in env but no DB schema
  - TD-005: OHLCV not proxied through Vercel Function
  - TD-006: No rate limiting on CoinGecko calls
  - TD-007: localStorage watchlist not backed by server state
  - TD-010: No error boundaries — chart crash = blank screen
  - TD-011: TanStack Query devtools not removed in production build
  - TD-012: No loading state in DashboardPage header (flickers on first load)
  - TD-015: WebSocket reconnection count not surfaced in UI
  - TD-017: DashboardPage header re-renders on every price tick (memo opportunity)
- Performance profiling + optimization pass
- Merge `develop → main` as stable MVP release tag

---

## Post-MVP Roadmap (Future Phases)

### Phase 6 — Forex Integration
- OANDA practice account data source
- `ForexSource implements MarketDataSource`
- Currency pair watchlist + forex charts
- Unified asset type indicator in UI

### Phase 7 — User Accounts + Cross-Device Sync
- Supabase Auth (email + OAuth)
- Server-persisted watchlists (Supabase RLS)
- Cross-device sync
- Migrate localStorage watchlist → Supabase on login

### Phase 8 — Price Alerts
- Alert configuration UI
- Server-side alert evaluation (Vercel Cron or serverless)
- Email/push notification pipeline (Supabase Edge Functions + Resend)

### Phase 9 — AI Market Insights
- Sentiment analysis integration (Finnhub news feed)
- Market narrative generation (Claude API)
- `lastRefreshedAt` hook point in analytics orchestrator — designed entry point for AI narrative triggers
- AI-assisted pattern recognition (experimental)

### Phase 10 — Advanced Charting
- Drawing tools (trendlines, support/resistance)
- Technical indicators (RSI, MACD, Bollinger Bands)
- Multi-timeframe comparison
- Chart layout templates

### Phase 11 — Multi-Asset Platform
- Stocks integration (Finnhub or Polygon.io)
- Portfolio tracking + P&L calculations
- Asset class comparison views

---

## Long-Term Vision

Expandable into a multi-asset analytics platform with AI-assisted market insights, price alerts, and advanced charting. Architecture decisions made today (MarketDataSource abstraction, centralized Zustand store, AppCore orchestrator pattern, pluggable data sources, Supabase Auth readiness) are specifically designed to enable this path without rewrites.
