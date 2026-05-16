# ARCHITECTURE.md

**Last Updated:** 2026-05-16
**Status:** APPROVED — Architecture Freeze in effect after Phase 1

---

## System Overview

MarketPulse is a browser-based financial market dashboard providing real-time crypto price monitoring with candlestick/line charting. The architecture follows a hybrid serverless + direct WebSocket pattern.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  Watchlist   │    │   Chart      │    │  Market   │ │
│  │  Component   │    │  Component   │    │ Overview  │ │
│  └──────┬───────┘    └──────┬───────┘    └─────┬─────┘ │
│         │                   │                   │       │
│  ┌──────▼───────────────────▼───────────────────▼─────┐ │
│  │              TanStack Query + Zustand               │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                               │
│          ┌──────────────┼──────────────┐               │
│          ▼              ▼              ▼               │
│   Direct WebSocket    REST API      REST API           │
│   (Live Prices)       (OHLCV)      (Metadata)         │
└───────┬──────────────────┬──────────────┬──────────────┘
        │                  │              │
        ▼                  ▼              ▼
  Binance WSS        Vercel Function   CoinGecko API
  (public, free)     /api/ohlcv        (public, free)
                          │
                          ▼
                    Supabase PostgreSQL
                    (OHLCV cache + config)
                          │
                    (on cache miss)
                          │
                          ▼
                    Binance REST API
                    (public, free)
```

---

## Layer Definitions

### Frontend (React + Vite + TypeScript)
**Location:** `/frontend/`
**Deploy:** Vercel (static site)

Responsibilities:
- All UI rendering
- Direct Binance WebSocket connection (live prices)
- State management via TanStack Query + Zustand
- Chart rendering via TradingView Lightweight Charts
- Watchlist persistence via localStorage

### Backend (Vercel Functions)
**Location:** `/api/`
**Deploy:** Vercel (serverless functions, co-deployed with frontend)

Responsibilities:
- OHLCV data caching proxy (Binance REST → Supabase → response)
- Default watchlist configuration endpoint
- Future: alert triggers, user data endpoints (if auth added)

NOT responsible for:
- Live WebSocket relay (browser connects directly to Binance)
- Persistent connections

### Database (Supabase PostgreSQL)
**Project:** Supabase free tier

Tables (to be designed in Phase 1):
- `ohlcv_cache` — cached candlestick data with TTL
- `app_config` — default coin lists, app settings
- `symbols` — supported symbol metadata cache
- Future: `users`, `watchlists`, `alerts`

### Live Data (Binance WebSocket)
**Endpoint:** `wss://stream.binance.com:9443/stream`
**Auth:** None required for public market data

Stream types used:
- `<symbol>@trade` — individual trade ticks (tick-by-tick prices)
- `<symbol>@kline_<interval>` — live OHLCV candles
- `<symbol>@miniTicker` — compact 24h stats (price change %, volume)

Combined stream endpoint supports up to 1024 subscriptions per connection.

### Metadata (CoinGecko API)
**Endpoint:** `https://api.coingecko.com/api/v3`
**Auth:** None required for free tier (rate limit: ~30 req/min)

Used for:
- Coin logos
- Market cap rankings
- Coin names and descriptions

---

## Data Abstraction Layer (Critical for Phase 2)

All market data access must go through a typed interface to allow forex integration in Phase 2 without architecture changes.

```typescript
// /frontend/src/api/market/types.ts
interface MarketDataSource {
  subscribeToPrice(symbol: string, callback: (price: TickData) => void): () => void;
  fetchOHLCV(symbol: string, interval: Interval, limit: number): Promise<Candle[]>;
  getSupportedSymbols(): Promise<MarketSymbol[]>;
}

// /frontend/src/api/market/binance.ts
class BinanceCryptoSource implements MarketDataSource { ... }

// /frontend/src/api/market/forex.ts (Phase 2)
class ForexSource implements MarketDataSource { ... }
```

---

## Frontend Folder Structure

```
frontend/
├── src/
│   ├── api/           # Data fetching + market data sources
│   │   └── market/    # MarketDataSource implementations
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # shadcn/ui base components
│   │   ├── charts/    # Chart components (Lightweight Charts)
│   │   ├── watchlist/ # Watchlist components
│   │   └── market/    # Market overview components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions, formatters
│   ├── pages/         # Route-level page components
│   ├── stores/        # Zustand stores
│   └── types/         # TypeScript type definitions
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## State Management Strategy

| Data Type | Tool | Reason |
|---|---|---|
| OHLCV / REST data | TanStack Query | Built-in caching, background refresh, loading states |
| Live WebSocket prices | Zustand store | Reactive, low overhead, updated by WS message handler |
| Active symbol | Zustand store | Shared across chart + watchlist components |
| Watchlist items | Zustand + localStorage | Client-side persistence, no backend needed |
| UI state (sidebar, theme) | Zustand store | Simple client state |

---

## Architecture Freeze Policy

The following MUST NOT change without tradeoff analysis and migration planning:
- Frontend framework: **React + Vite**
- Charting library: **TradingView Lightweight Charts**
- State management: **TanStack Query + Zustand**
- Styling: **Tailwind CSS + shadcn/ui**
- Backend runtime: **Vercel Functions (Node.js)**
- Database: **Supabase PostgreSQL**
- Deployment: **Vercel**
- Live data source: **Binance WebSocket API**

---

## Scalability Path

| Phase | Scaling Action |
|---|---|
| MVP | Fully free tier — direct browser WebSocket |
| Growth | Add server-side WS relay (Fly.io or Railway) if needed for alerts or aggregation |
| Scale | Add Redis cache layer (Upstash), CDN for static assets |
| Enterprise | Multi-region deployment, dedicated database, rate limit management |
