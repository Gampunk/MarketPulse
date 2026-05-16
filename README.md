# MarketPulse

A modern browser-based financial market dashboard providing real-time crypto and forex market visibility through clean visual analytics and responsive user experience.

---

## Vision

Real-time crypto price monitoring with candlestick/line charting, watchlists, market overview, and a scalable foundation for AI-assisted insights and multi-asset analytics.

## Target Users

Retail traders, crypto traders, forex traders, and market enthusiasts.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Charting | TradingView Lightweight Charts v5 |
| State (server) | TanStack Query v5 |
| State (client) | Zustand v5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Vercel Functions (Node.js serverless) |
| Database | Supabase PostgreSQL |
| Live prices | Binance WebSocket API (browser-direct) |
| Metadata | CoinGecko API |
| Deployment | Vercel |

---

## Architecture

```
Browser → Binance WebSocket (live tick prices, direct connection)
Browser → Vercel Functions → Supabase (OHLCV cache, config)
Browser → CoinGecko API (coin metadata, logos)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full system design.

---

## Project Status

**Current Phase:** Phase 1 — Project Foundation (in progress)

See [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) for active status.

---

## Development Setup

> Setup instructions will be added after Phase 1 scaffold is complete.

Prerequisites:
- Node.js v20+
- npm v10+
- Git

```bash
# Clone repository
git clone <repo-url>
cd marketpulse

# Install frontend dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Fill in Supabase credentials

# Start development server
npm run dev
```

---

## Documentation

| Document | Purpose |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, module structure |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision log with rationale |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Long-term direction and milestones |
| [docs/PHASES.md](docs/PHASES.md) | Phase definitions and completion conditions |
| [docs/TASKS.md](docs/TASKS.md) | Active task list |
| [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) | Current project state and blockers |
| [docs/RESEARCH.md](docs/RESEARCH.md) | Technology comparisons and findings |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Implementation history |
| [docs/BUGS.md](docs/BUGS.md) | Active bug tracking |
| [docs/TECH_DEBT.md](docs/TECH_DEBT.md) | Known shortcuts and future refactors |

---

## Roadmap Summary

- **Phase 1:** Project foundation (scaffold, tooling, deployment pipeline)
- **Phase 2:** Live price engine (Binance WebSocket, watchlist)
- **Phase 3:** Charting (candlestick + line, OHLCV pipeline)
- **Phase 4:** Dashboard depth (market overview, metadata)
- **Phase 5:** Stabilization + forex prep
- **Phase 6+:** Forex, user accounts, alerts, AI insights
