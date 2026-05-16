# ROADMAP.md

**Last Updated:** 2026-05-16
**Vision:** Browser-based financial market dashboard providing real-time crypto and forex market visibility through clean visual analytics and responsive user experience.

---

## MVP Goal

Ship a production-quality crypto market dashboard with:
- Live price watchlist (tick-by-tick, <1s updates)
- Candlestick + line charts with OHLCV data
- Market overview (gainers/losers, global stats)
- Dark mode, desktop-first UX
- Deployed on Vercel, backed by Supabase

---

## Phase Timeline

### Phase 0 — Project Initialization ✅ COMPLETE
**Completed:** 2026-05-16
- Environment readiness verification
- Stack selection and approval
- Architecture stabilization
- Operational documentation initialized

### Phase 1 — Project Foundation ✅ COMPLETE
**Completed:** 2026-05-16
- Git repository initialized
- React 19 + Vite + TypeScript scaffold
- Tailwind CSS v4 + shadcn/ui configured
- Path alias `@/`, TypeScript types, Zustand stores
- Base layout (AppLayout, Sidebar, TopBar, DashboardPage)
- React Router v7 + TanStack Query v5 configured
- `npm run build` passing clean (715ms, 0 errors)

### Phase 1.5 — Infrastructure Stabilization ✅ COMPLETE
**Completed:** 2026-05-16
- GitHub repository connected (`github.com/Gampunk/MarketPulse`)
- `main` + `develop` branches established
- Vercel deployment fixed and stabilized
  - Root Directory set to `frontend/`
  - `frontend/vercel.json` with SPA rewrite rules
  - Preview + production deployments working
- Supabase project created, credentials configured
- Environment variable pipeline established (local + Vercel)
- Deployment lessons documented

### Phase 2 — Live Price Engine 🔄 NEXT
**Scope:**
- Implement `BinanceCryptoSource` (MarketDataSource interface)
- Binance combined WebSocket stream (tick-by-tick)
- Live prices in Sidebar watchlist rows (price + 24h change %)
- Active symbol price stats in Dashboard
- Coin search + add/remove from watchlist
- WebSocket reconnection handling (basic)

**Completion Conditions:**
- Prices update in browser <1s from Binance stream
- Sidebar shows live price + color-coded 24h change for all watchlist items
- User can add any USDT pair to watchlist
- User can remove symbols from watchlist
- Watchlist persists across browser refresh

### Phase 3 — Charting + OHLCV Pipeline
**Scope:**
- TradingView Lightweight Charts integration
- Candlestick chart + Line chart with toggle
- Time range selector (15m, 1h, 4h, 1D, 1W, 1M)
- OHLCV data pipeline: Binance REST → Vercel Function → Supabase cache
- Relocate `/api/` to `frontend/api/` (backend deployment fix — TD-005)
- Supabase `ohlcv_cache` table schema
- Chart updates when watchlist symbol clicked

### Phase 4 — Dashboard Depth
**Scope:**
- Market overview panel (top gainers/losers by 24h change)
- Global market stats (BTC dominance, total market cap — CoinGecko)
- Coin metadata (logo, name, market cap rank — CoinGecko)
- Volume bars on candlestick charts
- CoinGecko rate limit management

### Phase 5 — Stabilization + Tech Debt
**Scope:**
- WebSocket reconnection polish (exponential backoff, UI status indicator)
- React error boundaries
- Performance profiling + optimization
- CI/CD: GitHub Actions (TypeScript check + ESLint + build gate)
- Forex data source research + MarketDataSource abstraction validation
- Tech debt cleanup (TD-003, TD-004, TD-007, TD-010)
- Merge `develop` → `main` as stable MVP release

---

## Post-MVP Roadmap (Future Phases)

### Phase 6 — Forex Integration
- Add forex data source (OANDA practice account — best free option)
- Implement `ForexSource implements MarketDataSource`
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

Expandable into a multi-asset analytics platform with AI-assisted market insights, price alerts, and advanced charting. Architecture decisions made today (MarketDataSource abstraction, modular Zustand stores, pluggable data sources, Supabase Auth readiness) are specifically designed to enable this path without rewrites.
