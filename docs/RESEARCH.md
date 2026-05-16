# RESEARCH.md

**Last Updated:** 2026-05-16

Technical research, comparisons, and findings from Phase 0B discovery.

---

## Market Data APIs — Crypto

### Binance WebSocket API (SELECTED)
- **Endpoint:** `wss://stream.binance.com:9443/stream`
- **Auth:** None for public market data
- **Rate limits:** 300 WebSocket connections per IP; 1024 subscriptions per connection
- **Data available:** Individual trades (tick), kline/OHLCV, mini-ticker (24h stats), depth
- **CORS support:** Yes — browser connections allowed
- **Combined streams:** Multiple symbols in one connection via `/stream?streams=btcusdt@trade/ethusdt@trade`
- **REST endpoint:** `https://api.binance.com/api/v3/klines` for historical OHLCV
- **Free tier:** Fully free, no account needed
- **Decision Confidence:** HIGH

### CoinGecko API (SELECTED — metadata only)
- **Endpoint:** `https://api.coingecko.com/api/v3`
- **Auth:** None (free tier, x-cg-demo-api-key header optional for higher limits)
- **Rate limits:** ~30 calls/min (free), 500 calls/min (paid)
- **Data available:** Market cap, logos, coin metadata, global stats, trending
- **Use case:** Coin logos, market cap rankings, global market data
- **Decision Confidence:** HIGH

### Alpha Vantage (NOT SELECTED)
- **Rate limits:** 25 calls/day (free), 75 calls/min ($50/month)
- **Data:** Stocks, crypto, forex
- **Verdict:** Too restrictive for free tier real-time use

### Finnhub (NOT SELECTED for MVP)
- **Rate limits:** 60 calls/min free, WebSocket available
- **Data:** Stocks, crypto, forex, news
- **Verdict:** Good candidate for Phase 2 news/sentiment integration

---

## Market Data APIs — Forex (Phase 2 Research)

### ExchangeRate-API
- **Free tier:** 1,500 calls/month
- **Data:** 161 currency pairs, daily rates
- **Verdict:** Too low frequency for tick-by-tick requirement

### Frankfurter API
- **Free:** Yes, no key required
- **Data:** ECB reference rates, daily
- **Verdict:** No real-time, not suitable for live dashboard

### Polygon.io Forex
- **Free tier:** 5 calls/min, delayed data (15min)
- **Paid:** Real-time WebSocket at $29/month
- **Verdict:** Phase 2 — needs budget allocation if real-time forex required

### OANDA (Recommended for Phase 2)
- **Free practice account:** Real-time forex streaming
- **WebSocket:** Available on practice accounts
- **Verdict:** Best free option for real-time forex — investigate for Phase 2

---

## Charting Library Comparison

| Library | Type | Bundle Size | Candlestick | WebGL | License | Verdict |
|---|---|---|---|---|---|---|
| TradingView Lightweight Charts | Financial-first | ~40KB | Native | Yes | Apache 2.0 | SELECTED |
| Recharts | General (D3 wrapper) | ~450KB | No | No | MIT | Too heavy, no financial charts |
| Chart.js + financial plugin | General | ~200KB | Plugin | No | MIT | Limited candlestick support |
| Highcharts Stock | Financial | ~400KB | Native | No | Commercial | Paid for commercial |
| Apache ECharts | General | ~900KB | Yes | Partial | Apache 2.0 | Too heavy |
| D3.js | Low-level | ~250KB | Custom | No | ISC | Too complex to build from scratch |

**Winner:** TradingView Lightweight Charts — purpose-built, smallest bundle, WebGL, free license.

---

## Frontend Framework Comparison

| Framework | Bundle | DX | Ecosystem | Financial UI Libs | SSR Needed? | Verdict |
|---|---|---|---|---|---|---|
| React + Vite | Medium | Excellent | Largest | Excellent | No | SELECTED |
| Next.js | Larger | Good | Large | Excellent | No | SSR overkill for real-time dashboard |
| Vue 3 + Vite | Small | Excellent | Medium | Good | No | Good option, smaller ecosystem |
| Svelte/SvelteKit | Smallest | Good | Small | Limited | No | Insufficient financial UI library support |

---

## Backend / Hosting Comparison (Free Tier Focus)

| Option | Persistent WS | Free Tier | Cold Start | Verdict |
|---|---|---|---|---|
| Vercel Functions | No (10s timeout) | Yes — generous | ~100ms | SELECTED for REST |
| Render (free) | Yes | Spins down after 15min | ~30s on wake | Not suitable for WS relay |
| Railway | Yes | $5 credit/month | Fast | Not permanently free |
| Fly.io | Yes | 256MB RAM, 3 VMs | Fast | Viable for Phase 2 WS relay |
| Cloudflare Durable Objects | Yes (edge) | Free with limits | <1ms (edge) | Vendor lock-in risk |
| Netlify Functions | No (10s timeout) | Yes | ~200ms | Similar to Vercel Functions |

---

## Database Comparison (Free Tier Focus)

| Database | Type | Free Storage | Serverless | Vendor Lock-in | Verdict |
|---|---|---|---|---|---|
| Supabase | PostgreSQL | 500MB | Yes | Low (standard PG) | SELECTED |
| Neon | Serverless PG | 0.5GB | Yes | Low | Good alternative |
| PlanetScale | MySQL | Deprecated | Yes | Medium | Free tier gone |
| MongoDB Atlas | Document | 512MB | Yes | Medium | Not ideal for structured market data |
| Upstash Redis | Redis | 10MB | Yes | Low | Use as cache layer in Phase 2+ |

---

## WebSocket Architecture Research

### Browser-Direct WebSocket (Binance)
- Browser opens WebSocket directly to Binance WSS
- CORS: Supported for public market data
- Use combined streams for multiple symbols: `wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade`
- Max 1024 symbol subscriptions per connection
- Reconnection handling required (network drops)
- Pattern: Used by Coinglass, Messari, and other major crypto dashboards

### Server-Side WS Relay (Phase 2+ consideration)
- Node.js maintains single upstream connection to Binance
- Distributes price updates to connected browser clients via WS
- Advantages: Single upstream connection shared across all users, enables server-side alerts
- Disadvantages: Requires persistent always-on server, adds infrastructure cost and complexity
- When to adopt: When alert system is needed or user count justifies shared upstream

---

## State Management Research

| Library | Use Case | Size | Verdict |
|---|---|---|---|
| TanStack Query v5 | Server/async state, caching | ~13KB | SELECTED — REST data |
| Zustand v5 | Client state, WebSocket data | ~1KB | SELECTED — live prices, UI state |
| Redux Toolkit | Complex app state | ~30KB | Overkill for MVP |
| Jotai | Atomic state | ~3KB | Good but less proven for WS patterns |
| SWR | Server state | ~7KB | Less feature-rich than TanStack Query |
| React Context | Simple state | 0KB | Performance issues with frequent WS updates |

---

## Vercel Deployment Learnings (Session 002)

### Lesson 1 — Root Directory Must Match vercel.json Location

**Finding:** Vercel's "Root Directory" project setting (in Vercel dashboard) is authoritative. The `vercel.json` file must live INSIDE the configured root directory, not at the repo root.

**Pattern:**
```
Vercel Root Directory: frontend/
vercel.json location:  frontend/vercel.json   ← CORRECT
                       vercel.json            ← WRONG (ignored by Vercel)
```

**Why It Matters:** Placing `vercel.json` at the repo root while the root directory is `frontend/` causes Vercel to use the dashboard settings but ignore the `vercel.json` file, leading to inconsistent behavior.

---

### Lesson 2 — Never Prefix Build Commands with Root Directory Navigation

**Finding:** When Vercel's root directory is configured, all build commands run FROM that directory. Adding `cd frontend &&` to build commands creates a double-navigation error.

**Anti-pattern:**
```json
{ "buildCommand": "cd frontend && npm run build" }
```

**Correct pattern (when root = frontend/):**
```json
{ "buildCommand": "npm run build" }
```

---

### Lesson 3 — SPAs Require Catch-All Rewrite Rules

**Finding:** Vercel serves static files. Any URL that doesn't map to a physical file returns 404. React Router handles routing client-side, so ALL paths must serve `index.html`.

**Required vercel.json config for any React SPA:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Symptoms without this rule:** Direct URL navigation works locally (Vite dev server handles it), but returns 404 in production for any path other than `/`.

---

### Lesson 4 — Vite Environment Variables Are Build-Time, Not Runtime

**Finding:** Variables prefixed with `VITE_` are injected into the static bundle during `npm run build`. They are NOT available at runtime from a server — they are compiled into the JavaScript bundle.

**Implications:**
1. Changing a `VITE_*` env var in Vercel dashboard requires a full rebuild + redeployment
2. `VITE_*` variables are visible in the browser (bundle inspection) — never put secrets here
3. Variables without `VITE_` prefix are NOT accessible in browser code at all
4. Server-side secrets (future Vercel Functions) should NOT use `VITE_` prefix

**Correct usage:**
```
VITE_SUPABASE_URL       → browser-accessible, safe (public URL)
VITE_SUPABASE_ANON_KEY  → browser-accessible, safe (Supabase anon key is designed to be public)
SUPABASE_SERVICE_KEY    → server-only (future Vercel Functions), never VITE_ prefixed
```

---

### Lesson 5 — Preview vs Production Deployment Separation

**Finding:** Vercel creates two deployment tracks:
- **Preview:** Auto-triggered on every push to any non-production branch. Gets a unique URL per deployment.
- **Production:** Triggered only on push to the production branch (configurable — typically `main`).

**Operational Pattern:**
- All feature development validated on Preview URLs (deploy from `develop` branch)
- Production URL is only promoted after Preview validation passes
- Both tracks use the same Vercel environment variables (can configure per-environment variables for different `VITE_API_*` values between Preview and Production)

---

### Lesson 6 — Monorepo Deployment Considerations

**Finding:** For a monorepo with `/frontend` + `/api` + `/docs`, Vercel requires an explicit root directory setting to know where the deployable application lives.

**Two viable patterns:**
```
Pattern A (current) — Frontend-first:
  Vercel Root: frontend/
  Frontend: deployed ✅
  API functions: frontend/api/ (future)
  Complexity: LOW

Pattern B — Repo root:
  Vercel Root: /
  vercel.json at root configures build/output
  API functions: /api/
  Complexity: MEDIUM (requires explicit outputDirectory config)
```

Pattern A is currently in use and is simpler for the MVP phase. Pattern B would be needed if the monorepo grows to include multiple deployable units (e.g., separate backend deployment).
