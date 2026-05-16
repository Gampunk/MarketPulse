# MarketPulse

A modern browser-based financial market dashboard providing real-time crypto and forex market visibility through clean visual analytics and a responsive dark-first user experience.

**Status:** Phase 1 + Infrastructure Complete — Phase 2 (Live Price Engine) in progress

---

## Vision

Real-time crypto price monitoring with candlestick/line charting, live watchlists, market overview panels, and a scalable foundation for AI-assisted insights and multi-asset analytics.

## Target Users

Retail traders, crypto traders, forex traders, and market enthusiasts.

---

## Stack

| Layer           | Technology                              | Status        |
|-----------------|-----------------------------------------|---------------|
| Frontend        | React 19 + Vite + TypeScript            | Deployed ✅    |
| Charting        | TradingView Lightweight Charts v5       | Integrated ✅  |
| State (server)  | TanStack Query v5                       | Configured ✅  |
| State (client)  | Zustand v5                              | Configured ✅  |
| Styling         | Tailwind CSS v4 + shadcn/ui             | Configured ✅  |
| Backend         | Vercel Functions (Node.js serverless)   | Deferred (P3) |
| Database        | Supabase PostgreSQL                     | Created ✅     |
| Live prices     | Binance WebSocket API (browser-direct)  | Phase 2       |
| Metadata        | CoinGecko API                           | Phase 4       |
| Deployment      | Vercel                                  | Live ✅        |

---

## Architecture

```
Browser → Binance WebSocket     (live tick prices — Phase 2)
Browser → Vercel Functions      (OHLCV cache — Phase 3)
        → Supabase PostgreSQL   (cache storage)
Browser → CoinGecko API         (metadata — Phase 4)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full system design and deployment architecture.

---

## Deployment

| Environment | Branch    | Trigger         | Status |
|-------------|-----------|-----------------|--------|
| Production  | `main`    | Push to main    | Live ✅ |
| Preview     | `develop` | Push to develop | Live ✅ |

**GitHub:** `github.com/Gampunk/MarketPulse`

**Vercel Configuration:**
- Root Directory: `frontend/`
- Build: `npm run build`
- Output: `dist/`
- SPA rewrite: all paths → `index.html`

---

## Local Development Setup

### Prerequisites
- Node.js v20+
- npm v10+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/Gampunk/MarketPulse.git
cd MarketPulse

# Install frontend dependencies
cd frontend
npm install

# Configure environment (copy template, fill in Supabase credentials)
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Start development server
npm run dev
# → http://localhost:5173
```

### Environment Variables

Create `frontend/.env.local` with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=
```

**Note:** `VITE_*` variables are compiled into the browser bundle at build time. Changes require a rebuild.

### Available Scripts (run from `frontend/`)

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # TypeScript check + production build
npm run lint     # ESLint
npm run preview  # Preview production build locally
```

---

## Project Structure

```
MarketPulse/
├── frontend/               # React + Vite application (Vercel deployment root)
│   ├── src/
│   │   ├── api/market/     # MarketDataSource implementations (Phase 2)
│   │   ├── components/
│   │   │   ├── layout/     # AppLayout, TopBar, Sidebar
│   │   │   ├── charts/     # Chart components (Phase 3)
│   │   │   └── ui/         # shadcn/ui base components
│   │   ├── pages/          # DashboardPage
│   │   ├── stores/         # Zustand stores (watchlist, prices)
│   │   └── types/          # TypeScript types + MarketDataSource interface
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
├── api/                    # Vercel Functions (not yet deployed — Phase 3)
│   └── health.ts
├── docs/                   # Operational documentation
├── system/                 # Project governance and vision
└── README.md
```

---

## Git Workflow

```
feature/* → develop (preview deploy) → main (production deploy)
```

- **`main`**: production-only, stable, tagged releases
- **`develop`**: active development, preview deployments
- **`feature/*`**: feature branches, opened as PRs to `develop`

---

## Documentation

| Document | Purpose |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, deployment, data flow, module structure |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision log with rationale |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Long-term direction and milestones |
| [docs/PHASES.md](docs/PHASES.md) | Phase definitions and completion conditions |
| [docs/TASKS.md](docs/TASKS.md) | Active task list |
| [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) | Current project state and blockers |
| [docs/RESEARCH.md](docs/RESEARCH.md) | Technology comparisons and deployment learnings |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Implementation history |
| [docs/BUGS.md](docs/BUGS.md) | Active bug tracking |
| [docs/TECH_DEBT.md](docs/TECH_DEBT.md) | Known shortcuts and future refactors |
| [docs/SESSION_CONTEXT.md](docs/SESSION_CONTEXT.md) | Session summaries and deployment lessons |

---

## Roadmap Summary

- **Phase 0:** Project initialization ✅
- **Phase 1:** Project foundation (scaffold, tooling) ✅
- **Phase 1.5:** Infrastructure stabilization (Vercel + Supabase) ✅
- **Phase 2:** Live price engine (Binance WebSocket, watchlist) ← **current**
- **Phase 3:** Charting (Lightweight Charts, OHLCV pipeline, backend)
- **Phase 4:** Dashboard depth (market overview, CoinGecko)
- **Phase 5:** Stabilization (CI/CD, error handling, tech debt)
- **Phase 6+:** Forex, user accounts, alerts, AI insights
