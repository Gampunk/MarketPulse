# TECH_DEBT.md

**Last Updated:** 2026-05-16

Known shortcuts, temporary decisions, and future refactor requirements.

---

## Active Technical Debt

### TD-001 — No Server-Side WebSocket Relay

**Added:** 2026-05-16
**Priority:** LOW (Phase 2+)
**Phase Introduced:** 0B (Architecture decision)

**Description:**
Each browser client opens its own WebSocket connection to Binance. At scale this is inefficient — many clients requesting the same symbol data creates redundant upstream connections. A server-side WS relay would multiplex all clients through a single upstream connection.

**Accepted Because:**
Free tier constraint makes persistent servers impractical for MVP. Binance allows browser WebSocket connections. At MVP user volumes, this is non-issue.

**When to Address:**
When alert system is built (requires server-side evaluation) or when user count makes shared upstream connections operationally valuable. Target: Phase 6+.

**Migration Path:**
Implement MarketDataSource interface from day 1. Swap BinanceCryptoSource from browser WebSocket to relay client without changing any UI components.

---

### TD-002 — localStorage Watchlist (No Server Persistence)

**Added:** 2026-05-16
**Priority:** LOW (Phase 7)
**Phase Introduced:** 0B (Architecture decision)

**Description:**
Watchlists are stored in browser localStorage. No cross-device sync. Clearing browser data loses watchlist.

**Accepted Because:**
No auth system in MVP. localStorage is sufficient for single-device use cases at launch.

**When to Address:**
When user accounts are added (Phase 7). Supabase Auth + watchlist table will replace localStorage.

**Migration Path:**
Zustand watchlist store already abstracts persistence. Swap localStorage adapter for Supabase adapter.

---

### TD-003 — No Rate Limit Management for CoinGecko

**Added:** 2026-05-16
**Priority:** MEDIUM (Phase 3)
**Phase Introduced:** 0B (Architecture decision)

**Description:**
CoinGecko free tier allows ~30 calls/minute. No rate limit handling or retry logic planned for MVP.

**Accepted Because:**
Early-stage MVP will not hit rate limits. CoinGecko metadata (logos, rankings) doesn't need frequent refresh.

**When to Address:**
Phase 3 or when CoinGecko 429 errors appear. Add cache headers, retry-after handling, and aggressive caching in TanStack Query.

---

### TD-004 — No Error Boundaries on WebSocket Disconnects

**Added:** 2026-05-16
**Priority:** MEDIUM (Phase 5)
**Phase Introduced:** 0B (Architecture planning)

**Description:**
Binance WebSocket connections will disconnect on network interruption. Without reconnection logic and error boundaries, the UI will silently stale.

**Accepted Because:**
Phase 1 scaffold doesn't need this. Planned for Phase 5 stabilization.

**When to Address:**
Phase 5. Implement exponential backoff reconnection + UI indicators for connection status.

---

## Resolved Technical Debt

None yet.
