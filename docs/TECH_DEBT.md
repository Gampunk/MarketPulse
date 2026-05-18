# TECH_DEBT.md

**Last Updated:** 2026-05-16

Known shortcuts, temporary decisions, and future refactor requirements. Each entry includes when it was introduced, why it was accepted, and when it should be resolved.

---

## Active Technical Debt

### TD-001 — No Server-Side WebSocket Relay

**Added:** 2026-05-16 | **Priority:** LOW | **Target:** Phase 7+
**Phase Introduced:** 0B (Architecture decision)

**Description:** Each browser client opens its own WebSocket connection to Binance. At scale this is inefficient — many clients requesting the same symbol data creates redundant upstream connections. A server-side relay would multiplex all clients through a single connection.

**Accepted Because:** Free tier constraint. Binance allows browser WebSocket connections. Non-issue at MVP user volumes.

**When to Address:** When alert system requires server-side price evaluation, or when user scale justifies aggregation.

**Migration Path:** MarketDataSource interface is already in place. Swap `BinanceCryptoSource` from browser WebSocket to relay client without UI changes.

---

### TD-002 — localStorage Watchlist (No Server Persistence)

**Added:** 2026-05-16 | **Priority:** LOW | **Target:** Phase 7
**Phase Introduced:** 0B (Architecture decision)

**Description:** Watchlists stored in browser localStorage. No cross-device sync. Browser data clear loses watchlist.

**Accepted Because:** No auth system in MVP. localStorage sufficient for single-device use.

**When to Address:** When user accounts are added (Phase 7). Supabase Auth + watchlist table replaces localStorage.

**Migration Path:** Zustand watchlist store already abstracts persistence. Swap localStorage adapter for Supabase adapter.

---

### TD-003 — No Rate Limit Management for CoinGecko

**Added:** 2026-05-16 | **Priority:** MEDIUM | **Target:** Phase 4
**Phase Introduced:** 0B (Architecture decision)

**Description:** CoinGecko free tier: ~30 calls/minute. No rate limit handling or retry logic.

**Accepted Because:** MVP won't hit rate limits. Metadata doesn't need frequent refresh.

**When to Address:** Phase 4 (CoinGecko integration). Add cache headers, retry-after handling, aggressive TanStack Query caching.

---

### TD-004 — No Error Boundaries on WebSocket Disconnects

**Added:** 2026-05-16 | **Priority:** MEDIUM | **Target:** Phase 5
**Phase Introduced:** 0B (Architecture planning)

**Description:** Binance WebSocket connections will disconnect on network interruption. Without reconnection logic, UI will silently stale.

**Accepted Because:** Phase 1/2 don't need this. Planned for Phase 5 stabilization.

**When to Address:** Phase 5. Implement exponential backoff reconnection + connection status indicators in UI.

---

### TD-005 — Backend API Not Deployed (Outside Vercel Root)

**Added:** 2026-05-16 | **Priority:** MEDIUM | **Target:** Phase 3
**Phase Introduced:** Infrastructure Stabilization (Session 002)

**Description:** The `/api/health.ts` Vercel Function at the project root is NOT deployed. Vercel's deployment root is `frontend/`, so `/api/` at the project root is outside the deployment scope. Backend API routes are currently inactive.

**Accepted Because:** No backend endpoints are needed for Phase 1 or Phase 2. The Binance WebSocket is a direct browser connection. The OHLCV caching endpoint (the first real backend need) is Phase 3.

**When to Address:** Phase 3. Relocate `/api/` to `frontend/api/` so it is within the Vercel deployment root. Update Vercel Functions accordingly.

**Migration Path:**
```
Current: /api/health.ts (outside Vercel root — inactive)
Phase 3: /frontend/api/ohlcv.ts (inside Vercel root — active)
```

---

### TD-006 — No Supabase Database Schema

**Added:** 2026-05-16 | **Priority:** MEDIUM | **Target:** Phase 3
**Phase Introduced:** Infrastructure Stabilization (Session 002)

**Description:** Supabase project exists and credentials are configured, but no database tables have been created. The database is empty.

**Accepted Because:** No database reads/writes are needed until Phase 3 (OHLCV caching).

**When to Address:** Phase 3. Design and create schema:
- `ohlcv_cache` — candlestick data with symbol, interval, timestamp, TTL
- `app_config` — default coin lists, app settings
- `symbols` — supported symbol metadata cache

---

### TD-007 — No CI/CD Workflow

**Added:** 2026-05-16 | **Priority:** LOW | **Target:** Phase 5
**Phase Introduced:** Infrastructure Stabilization (Session 002)

**Description:** Deployments are triggered by git push with no automated testing, linting, or quality gate before reaching Vercel. No GitHub Actions workflow exists.

**Accepted Because:** MVP phase. Manual pre-push discipline is sufficient at this scale. Adding CI too early adds operational complexity that slows iteration.

**When to Address:** Phase 5 (stabilization). Add GitHub Actions:
- TypeScript check (`tsc --noEmit`)
- ESLint
- Build validation
- Block merge to `main` if CI fails

---

### TD-008 — No Authentication Layer

**Added:** 2026-05-16 | **Priority:** LOW | **Target:** Phase 7
**Phase Introduced:** 0B (Architecture decision)

**Description:** Application is a fully public tool with no user identity. No login, no user-specific data, no session management.

**Accepted Because:** Intentional for MVP. localStorage sufficient for single-device watchlists.

**When to Address:** Phase 7. Use Supabase Auth (email/OAuth). Design RLS policies for user-specific data from day one of schema creation (Phase 3).

---

### TD-009 — Placeholder UI (No Live Data)

**Added:** 2026-05-16 | **Priority:** HIGH | **Target:** Phase 2
**Phase Introduced:** Phase 1 (scaffold)

**Description:** Dashboard stat cards show `—` placeholders. Sidebar watchlist has no prices. No Binance WebSocket connected. All market data fields are empty.

**Accepted Because:** Phase 1 established the layout scaffold. Data integration is Phase 2.

**When to Address:** Phase 2. Implement `BinanceCryptoSource`, wire into `PricesStore`, update Sidebar and DashboardPage with live data.

---

### TD-010 — Deployment Process Partially Manual

**Added:** 2026-05-16 | **Priority:** LOW | **Target:** Phase 5
**Phase Introduced:** Infrastructure Stabilization (Session 002)

**Description:** Deployments require:
1. Manual `git push` to trigger Vercel
2. Manual preview URL validation
3. Manual merge to `main` for production promotion
No automated deployment gates, no rollback automation.

**Accepted Because:** Acceptable for MVP solo development. Adds no meaningful risk at current scale.

**When to Address:** Phase 5. Add automated test gate in GitHub Actions before allowing production promotion. Consider branch protection rules on `main`.

---

### TD-011 — `HISTORY_READY_THRESHOLD` Is a Magic Number

**Added:** 2026-05-18 | **Priority:** LOW | **Target:** Phase 3C
**Phase Introduced:** Phase 3B (bug fix)

**Description:** `HISTORY_READY_THRESHOLD = 50` in `CandlestickChart.tsx` distinguishes a full REST history response (300 candles) from a single live kline (1 candle) arriving before REST completes. Works because Binance's default `limit` is 300. If `fetchKlines` limit changes or a sparse market returns fewer candles, the threshold may gate incorrectly.

**Accepted Because:** Correct at current `limit=300`. Handles the race condition reliably at MVP scale.

**When to Address:** Phase 3C. Derive threshold from actual fetch limit (`limit * 0.15` or explicit constant imported from the fetcher), not a standalone magic number.

---

### TD-012 — `useKlineData` Callback Is a No-Op

**Added:** 2026-05-18 | **Priority:** LOW | **Target:** Phase 3C or 4
**Phase Introduced:** Phase 3A

**Description:** `binanceSource.subscribeToKlines(symbol, interval, () => {})` — the callback passed from `useKlineData` does nothing. The actual store write happens inside `BinanceCryptoSource.handleKline()` directly via `useMarketStore.getState().updateKlineCandle()`. The `subscribeToKlines` callback exists in the `MarketDataSource` interface for source implementations that need per-consumer callbacks, but the Binance implementation bypasses it.

**Accepted Because:** Architecturally correct — the store is the write destination, not individual consumers. The callback is a hook in the interface for future flexibility.

**When to Address:** Either document explicitly in `useKlineData` (preferred), or remove the callback from `MarketDataSource` if no implementation ever uses it.

---

### TD-013 — `TimeframeSelector` Does Not Expose `1w`

**Added:** 2026-05-18 | **Priority:** LOW | **Target:** Phase 3C or 4
**Phase Introduced:** Phase 3B

**Description:** `Interval` type includes `'1w'` but `TimeframeSelector` only renders `['1m', '5m', '15m', '1h', '4h', '1d']`. Minor inconsistency — the type system promises `1w` support but the UI doesn't expose it.

**Accepted Because:** `1w` candles on a 300-candle history window would only show ~6 years of data — lower priority. Binance supports weekly klines.

**When to Address:** Phase 3C or 4. Add `1w` to `TimeframeSelector` if weekly charting is a product priority.

---

### TD-014 — No Line Chart Toggle

**Added:** 2026-05-18 | **Priority:** MEDIUM | **Target:** Phase 3C
**Phase Introduced:** Phase 3B

**Description:** ROADMAP.md Phase 3 originally included "Candlestick + Line chart with toggle." Not delivered in Phase 3B. `CandlestickChart` only renders candlestick. No mechanism exists to swap series type without chart recreation.

**When to Address:** Phase 3C. The `useChartEngine` series registry enables clean series swapping. `ChartTypeSelector` and `PriceChart` deliver this as part of Phase 3C scope.

---

## Resolved Technical Debt

### TD-009 — Placeholder UI (No Live Data) — RESOLVED Phase 2
**Resolved:** 2026-05-18 — `BinanceCryptoSource` wired, sidebar + stat cards show live data

### TD-004 — No Error Boundaries on WebSocket Disconnects — PARTIALLY RESOLVED Phase 2
**Status:** Reconnection logic implemented in `BinanceCryptoSource` (exponential backoff, `resubscribeAll`). UI status indicator still pending — tracked in Phase 5.
