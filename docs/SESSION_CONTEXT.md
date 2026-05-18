# SESSION_CONTEXT.md

**Last Updated:** 2026-05-18

---

## Session 004 — 2026-05-18 — Phase 3A: Centralized Market State Infrastructure

### What Happened

Phase 3A architecture was approved and implemented in full. Context window was exhausted during documentation updates; work was resumed in a new session from the compacted summary.

WebSocket singleton refactor (completed during this session prior to Phase 3A):
- Fixed "WebSocket is closed before connection is established" and "Ping received after close" errors
- Implemented stale handler guard (`if (this.ws !== ws) return`) on all socket event handlers
- `ensureConnected()` now correctly handles all readyStates including CLOSING (2)
- `usePriceStream` migrated to delta subscription (useRef map — only subscribes/unsubscribes the diff)

Phase 3A implementation:

### Implementation Delivered

**New files:**
- `frontend/src/stores/market.ts` — `useMarketStore` (Zustand v5, devtools). Slices: tickers, klines, symbols, connection. `updateKlineCandle` merge engine with 500-candle rolling window.
- `frontend/src/api/rest/binance.ts` — standalone `fetchKlines` + `fetchExchangeInfo` REST fetchers
- `frontend/src/hooks/useKlineData.ts` — historical fetch (TanStack Query, 5min stale) + live stream subscription; deposits into market store

**Modified files:**
- `frontend/src/types/market.ts` — added `ConnectionStatus` type; added `subscribeToKlines` to `MarketDataSource` interface
- `frontend/src/api/market/binance.ts` — full rewrite: kline stream support (`klineSubs` nested map), `handleKline()`, `resubscribeAll()`, `hasActiveSubscriptions()`, connection status writes to `useMarketStore`, stale handler guard on all handlers; REST methods delegate to `api/rest/binance.ts`
- `frontend/src/components/layout/Sidebar.tsx` — `usePricesStore` → `useMarketStore`, `s.prices[symbol]` → `s.tickers[symbol]`
- `frontend/src/pages/DashboardPage.tsx` — `usePricesStore` → `useMarketStore`, added `useKlineData(activeSymbol, '1m')`, added kline count display in chart placeholder

**Deleted files:**
- `frontend/src/stores/prices.ts` — fully removed; zero remaining imports verified

### Architecture Notes

**Stream→Store architecture:** BinanceCryptoSource singleton is the sole owner of the WebSocket. It writes directly to `useMarketStore` (via `getState()`) — no React intermediaries. Components only read from the store via selectors. UI never owns market infrastructure.

**Candle merge engine:** `updateKlineCandle(symbol, interval, candle, isClosed)`:
- `candle.time === last.time` → replace last (live open candle updating)
- `candle.time > last.time` → append (new closed candle)
- `candle.time < last.time` → discard (late/out-of-order frame)
- Rolling 500-candle window enforced on every write

**klineSubs structure:** `Map<symbol, Map<interval, Set<callback>>>` — mirrors the nested Binance stream routing

**REST layer:** `api/rest/binance.ts` is standalone and framework-agnostic. `BinanceCryptoSource.fetchOHLCV` delegates to it. TanStack Query in `useKlineData` also calls it directly.

**Phase 3A verification stub:** DashboardPage chart placeholder shows "1m candles loaded: N" — confirms history deposit and live merge are working without requiring a chart component.

### Build State After Session 004

- `npm run build` → 0 TypeScript errors, 664ms
- Branch: `feature/live-price-engine` (Phase 3A code complete, uncommitted)

### Pending Before Next Session

1. Human runs Phase 3A verification checklist (see below)
2. Commit Phase 3A (`user.name="Gampunk"`, `user.email="meetrao97@gmail.com"`)
3. Push `feature/live-price-engine` → open PR to `develop`
4. Begin Phase 3B (TradingView chart component)

### Phase 3A Runtime Verification Checklist

Run `npm run dev` at `localhost:5173` and check:

**WebSocket:**
- [ ] Console shows `[Binance WS] Connecting to wss://stream.binance.com:9443/stream` (once)
- [ ] Console shows `[Binance WS] Connected`
- [ ] Network → WS tab shows exactly one WebSocket connection
- [ ] Ticker prices still updating in sidebar (green/red live)

**Historical kline fetch:**
- [ ] Console shows `[KlineData] Fetching historical BTCUSDT/1m (limit: 300)`
- [ ] Console shows `[KlineData] Loaded 300 historical candles for BTCUSDT/1m`

**Live kline stream:**
- [ ] Console shows `[Binance WS] Subscribe kline: btcusdt@kline_1m`
- [ ] Console shows `[Binance WS] Kline BTCUSDT/1m (live) close=...` updating every second

**UI verification:**
- [ ] Chart placeholder shows `1m candles loaded: 300` (or similar non-zero)
- [ ] No "WebSocket is closed before connection is established" errors
- [ ] No "Ping received after close" errors

**Redux DevTools (if installed):**
- [ ] MarketPulse store visible in devtools
- [ ] `tickers` slice has live price data
- [ ] `klines` slice has `BTCUSDT → 1m → [300 candles]`
- [ ] `connection` slice shows `status: connected`

---

## Session 003 — 2026-05-18 — Phase 2: Live Price Engine

### What Happened

Phase 2 implementation completed in full. Governance migration (Shared-System centralization) was validated at session start before any code was written. All Phase 2 completion conditions met.

### Implementation Delivered

**New files:**
- `frontend/src/api/market/binance.ts` — `BinanceCryptoSource` class (implements `MarketDataSource`)
- `frontend/src/lib/formatters.ts` — price, volume, change formatters
- `frontend/src/hooks/usePriceStream.ts` — app-level WebSocket lifecycle hook
- `frontend/src/components/watchlist/AddSymbolSearch.tsx` — inline coin search component

**Modified files:**
- `frontend/src/App.tsx` — added `usePriceStream()` call
- `frontend/src/components/layout/Sidebar.tsx` — live prices, remove button
- `frontend/src/pages/DashboardPage.tsx` — live stat cards

### Architecture Notes

**WebSocket strategy:** Single `BinanceCryptoSource` singleton. Uses Binance combined stream URL for initial connection (all symbols at once), then dynamic SUBSCRIBE/UNSUBSCRIBE messages for runtime changes. Exponential backoff reconnection (1s → 2s → 4s → ... → 30s max).

**Data flow:** Binance WSS → `handleTick()` in BinanceCryptoSource → `usePricesStore.setPrice()` → Sidebar/DashboardPage re-render via Zustand subscription.

**Coin search:** TanStack Query fetches `/api/v3/exchangeInfo` (SPOT permissions) once when search opens, cached 1 hour. Filters USDT TRADING pairs client-side.

**Remove watchlist:** Unsubscribes from price stream immediately. If no remaining subscribers, closes WebSocket cleanly.

**MarketDataSource interface:** Preserved intact. BinanceCryptoSource is a drop-in implementation. Forex source can be swapped in Phase 6 without UI changes.

### Build State After Session 003

- `npm run build` → 0 errors, 1.15s, 308KB JS gzipped 97KB
- Branch: `feature/live-price-engine` (clean, unpushed)

### What To Do Next Session

1. Push `feature/live-price-engine` → PR to `develop` → merge
2. Merge `develop` → `main` (first live-price-enabled production release)
3. Begin Phase 3 planning: TradingView Lightweight Charts, OHLCV pipeline, Vercel Function setup

---

## Session 002 — 2026-05-16 — Infrastructure Stabilization — 2026-05-16 — Infrastructure Stabilization

### What Happened

Post-Phase 1 infrastructure deployment and stabilization. The user independently completed the Vercel and Supabase setup and worked through deployment issues before entering this stabilization documentation session.

### Deployment Problems Encountered and Resolved

#### Problem 1 — Deployment Root Mismatch
**Symptom:** Vercel deployment was failing or serving incorrect content.
**Root Cause:** The initial `vercel.json` was placed at the project root (`/vercel.json`) and referenced `frontend/` as the build directory (`cd frontend && npm run build`). Vercel's deployment root was ambiguous — it was treating the repo root as the project root, creating path resolution confusion.
**Fix:** Set Vercel's "Root Directory" project setting to `frontend/`. Created `frontend/vercel.json` with framework-relative paths. The `vercel.json` inside the root directory tells Vercel how to build relative to that root, not relative to the repo root.
**Lesson:** Vercel's `vercel.json` must live inside the Root Directory configured in Vercel settings. If Root Directory = `frontend/`, then `vercel.json` must be at `frontend/vercel.json`, and all paths within it are relative to `frontend/`.

#### Problem 2 — frontend/frontend Nested Root
**Symptom:** Build commands were running from the wrong working directory, causing nested path issues (e.g., Vite looking for files at `frontend/frontend/src/`).
**Root Cause:** A `cd frontend &&` prefix in the root-level `vercel.json` build command was redundant — Vercel was already running commands from within the `frontend/` root directory as configured.
**Fix:** Removed `cd frontend &&` prefix. The final `frontend/vercel.json` uses `"buildCommand": "npm run build"` with no path prefix — Vercel already executes from the correct directory.
**Lesson:** When the Root Directory is configured in Vercel settings, all commands in `vercel.json` run relative to that directory. Never add `cd <rootdir> &&` to build commands when the root directory is already set.

#### Problem 3 — SPA Routing 404 in Production
**Symptom:** Direct URL navigation (e.g., refreshing or bookmarking a React Router route) returned a 404 in production.
**Root Cause:** Vercel was serving static files and returned 404 for any path that didn't map to a physical file. React Router handles routing client-side, so all paths must serve `index.html`.
**Fix:** Added catch-all rewrite rule to `frontend/vercel.json`:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```
**Lesson:** All SPAs deployed to static hosts (Vercel, Netlify, Cloudflare Pages) require a catch-all rewrite to `index.html`. This is mandatory for client-side routing to function in production.

#### Problem 4 — Root Directory Persistence in Vercel Settings
**Symptom:** Changing `vercel.json` content didn't change deployment behavior.
**Root Cause:** The Root Directory setting in Vercel's project settings overrides `vercel.json` location. This setting persists between deployments and must be set correctly once in the Vercel dashboard.
**Fix:** Confirmed Root Directory = `frontend/` in Vercel project settings. This setting takes precedence over any `vercel.json` at the repo root.
**Lesson:** Vercel's Root Directory project setting (in dashboard) is authoritative. It persists across all future deployments. If it's wrong, `vercel.json` changes at the repo root will have no effect.

#### Problem 5 — Vite Environment Variable Build-Time Injection
**Symptom:** Environment variables configured in Vercel dashboard were not available in the production app.
**Root Cause:** Vite only exposes variables prefixed with `VITE_` to the client bundle. These are injected at **build time**, not at runtime. Variables must exist in the build environment, not just the server runtime environment.
**Fix:** Ensured all client-visible variables use the `VITE_` prefix (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and are added to Vercel's Environment Variables before triggering a new deployment.
**Lesson:** In Vite apps, `VITE_*` variables are compiled into the static bundle during `npm run build`. They are NOT dynamically read at runtime. Any change to these variables requires a full rebuild and redeployment to take effect. Non-`VITE_` variables are server-side only (available in Vercel Functions but not in the browser bundle).

#### Problem 6 — Local vs Cloud Environment Separation
**Root Cause / Learning:** `.env.local` is read by Vite during local development only. Vercel reads its own environment variable store during cloud builds. The two environments are completely separate — no automatic sync.
**Operational Pattern Established:**
- `.env.local` → local development only (in `.gitignore`, never committed)
- `.env.example` → committed template (shows variable names, no values)
- Vercel Dashboard → cloud environment variables (set manually per environment: Preview, Production)
**Lesson:** Always maintain parity between `.env.local` and Vercel's environment variable dashboard. Divergence causes "works locally, broken in production" bugs.

### Infrastructure State After Session 002

- GitHub remote connected: `https://github.com/Gampunk/MarketPulse.git`
- Git branches: `main` (production baseline) + `develop` (active development)
- Vercel project: linked, deploying from `frontend/` root directory
- Production deployment: working ✅
- Preview deployments: auto-trigger on branch push ✅
- Supabase: project created, credentials in `.env.local` + Vercel dashboard
- `frontend/vercel.json`: correct config (`framework: vite`, SPA rewrite)

### Architectural Correction (Session 002)

**Backend API deferred:** The `/api/health.ts` Vercel Function at the project root is NOT currently deployed. Reason: Vercel's root directory is `frontend/`, which means only files inside `frontend/` are included in the deployment. The `/api/` folder at the project root is outside the Vercel deployment scope.

**Implication:** Backend API integration requires one of:
1. Moving `/api/` inside `frontend/api/` (supported by Vercel when root = `frontend/`)
2. OR changing Vercel root back to project root and re-configuring frontend build (more complex)

Option 1 is the lower-risk path and maintains the current stable deployment. Deferred to Phase 3 (when OHLCV caching endpoint is actually needed).

### What To Do Next Session

Begin Phase 2 implementation:
1. Merge `develop` → `main` (infrastructure stabilization is stable)
2. Create `feature/live-price-engine` from `develop`
3. Implement `BinanceCryptoSource` in `frontend/src/api/market/binance.ts`
4. Wire live prices into `PricesStore`
5. Update `Sidebar` to display live prices

---

## Session 001 — 2026-05-16 — Phase 0 + Phase 1

### Summary
Full project initialization from scratch. Phase 0 (environment readiness + architecture stabilization) and Phase 1 (project foundation scaffold) both completed in a single session.

### Environment Verified
- Node.js v24.15.0, npm 11.12.1, Git 2.53.0, VS Code 22.22.1, Python 3.13.13
- npm is the package manager for this project

### Architecture Approved (Session 001)
- Frontend: React 19 + Vite + TypeScript → Vercel
- Charts: TradingView Lightweight Charts v5
- State: TanStack Query v5 + Zustand v5
- Styling: Tailwind CSS v4 + shadcn/ui
- Backend: Vercel Functions (serverless Node.js)
- Database: Supabase PostgreSQL
- Live data: Browser → Binance WebSocket (direct)
- Metadata: CoinGecko API (free tier)
- Deployment: Vercel (frontend + functions co-deployed)

### Key Scope Decisions
- Crypto-first MVP; forex in product Phase 2
- No user authentication — localStorage for watchlists
- Tick-by-tick live prices (<1s) via direct Binance WebSocket
- Candlestick + Line charts required
- Free tier only (Vercel + Supabase)
- Desktop-first MVP

### Phase 1 Deliverables
- Git initialized, React + Vite scaffold, Tailwind v4, path alias `@/`
- Complete src/ folder architecture + types + stores + layout components
- MarketDataSource interface defined (critical abstraction for Phase 2 forex)
- React Router v7 + TanStack Query v5 wired
- `/api/health.ts` + root `vercel.json` + `.env.example` created
- Build: clean (0 errors, 715ms) | Dev server: 473ms cold start
