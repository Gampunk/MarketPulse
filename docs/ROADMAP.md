# ROADMAP.md

**Last Updated:** 2026-05-16
**Vision:** Browser-based financial market dashboard providing real-time crypto and forex market visibility through clean visual analytics and responsive user experience.

---

## MVP Goal

Ship a production-quality crypto market dashboard with:
- Live price watchlist (tick-by-tick)
- Candlestick + line charts with OHLCV data
- Market overview (gainers/losers, global stats)
- Dark mode, desktop-first UX

---

## Phase Timeline

### Phase 0 — Project Initialization ✅ COMPLETE
**Target:** 2026-05-16
- Environment readiness
- Stack selection
- Architecture stabilization
- Documentation initialization

### Phase 1 — Project Foundation
**Target:** ~1-2 sessions
- Git + GitHub setup
- React + Vite + TypeScript scaffold
- Tailwind + shadcn/ui
- Vercel + Supabase setup
- Base layout + routing

### Phase 2 — Live Price Engine
**Target:** ~2-3 sessions
- Binance WebSocket integration
- Real-time watchlist
- Coin search
- Price change indicators

### Phase 3 — Charting
**Target:** ~2-3 sessions
- TradingView Lightweight Charts
- Candlestick + line chart
- OHLCV caching pipeline
- Time range selector

### Phase 4 — Dashboard Depth
**Target:** ~1-2 sessions
- Market overview panel
- Global stats
- CoinGecko metadata integration
- Polish + dark mode refinement

### Phase 5 — Stabilization
**Target:** ~1 session
- Error handling + connection resilience
- Performance profiling
- Tech debt cleanup
- Forex connector abstraction prep

---

## Post-MVP Roadmap (Future Phases)

### Phase 6 — Forex Integration
- Add forex data source (API TBD in Phase 5)
- Extend MarketDataSource abstraction
- Currency pair watchlist
- Forex charts

### Phase 7 — User Accounts + Persistence
- Supabase Auth integration
- Server-persisted watchlists
- Cross-device sync

### Phase 8 — Alerts System
- Price alert configuration (localStorage → server)
- Email/push notification pipeline
- Server-side alert evaluation

### Phase 9 — AI Market Insights
- Sentiment analysis integration
- News feed aggregation
- AI-assisted pattern recognition (experimental)

### Phase 10 — Advanced Charting
- Drawing tools (trendlines, support/resistance)
- Technical indicators (RSI, MACD, Bollinger Bands)
- Chart templates / saved layouts

### Phase 11 — Multi-Asset Platform
- Stocks integration (if API viable)
- Portfolio tracking
- P&L calculations

---

## Long-Term Vision

Expandable into a multi-asset analytics platform with AI-assisted market insights, alerts, and advanced charting capabilities. Architecture decisions made today (data abstraction layer, modular state management, pluggable data sources) are specifically designed to enable this path without rewrites.
