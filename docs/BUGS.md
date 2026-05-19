# BUGS.md

**Last Updated:** 2026-05-19

Active bug tracking. All bugs must include reproduction steps and current status.

---

## Active Bugs

None.

---

## Tech Debt (Low Priority — Phase 5)

**TD-017 — DashboardPage header re-renders on every price tick**
- **Severity:** LOW
- **Phase:** Phase 5
- The `price` and `meta` selectors in `DashboardPage` cause the entire page header (symbol name, logo, rank badge, price, change %) to re-render on every ticker update (~1/sec).
- Fix: extract header into a memoized component with scoped selectors.

---

## Resolved Bugs

### BUG-001 — Top Gainers and Top Losers showing identical coins
**Severity:** HIGH
**Status:** RESOLVED
**Reported:** 2026-05-19
**Phase:** Phase 4B

**Description:**
Top Gainers and Top Losers both displayed the same coins (BTC, ETH, USDT, BNB, XRP). Expected: top positive performers in Gainers, top negative performers in Losers.

**Root Cause:**
CoinGecko free tier silently ignores `order=price_change_percentage_24h_desc/asc` query parameters and always returns coins sorted by market cap. The two separate sorted-endpoint calls both returned the same top market cap coins.

**Fix:**
Replaced two separate `fetchTopGainers` / `fetchTopLosers` functions with a single `fetchMarketMovers(universeSize, topN)` that fetches the top-200 coins by market cap (the only reliably honored ordering on the free tier), then filters and sorts client-side: gainers (`changePct24h > 0` sorted descending), losers (`changePct24h < 0` sorted ascending). Coins can never appear in both lists. Also consolidates from 2 API calls to 1 for movers, saving 4 req/hr.

---

### BUG-002 — Chart squeezed when MarketOverview added
**Severity:** MEDIUM
**Status:** RESOLVED
**Reported:** 2026-05-19
**Phase:** Phase 4B

**Description:**
After adding `<MarketOverview />` below the stat cards, the chart shrunk to a very small height.

**Root Cause:**
`DashboardPage` had `h-full` on its outer div, locking content to exactly viewport height in a flex column. Adding MarketOverview caused available height to be split between chart and overview panel, squeezing the chart.

**Fix:**
Removed `h-full` from the DashboardPage outer div (now `flex flex-col gap-4 pb-4`). Changed chart container from `flex-1 min-h-0` to `h-[clamp(300px,45vh,560px)]`. Total content naturally exceeds viewport height, activating `main.overflow-auto` scroll.

---

### BUG-003 — Page not scrollable after MarketOverview added
**Severity:** MEDIUM
**Status:** RESOLVED
**Reported:** 2026-05-19
**Phase:** Phase 4B

**Description:**
The page could not be scrolled with mouse wheel or keyboard after MarketOverview was added.

**Root Cause:**
Same `h-full` lock as BUG-002 — content was constrained to viewport height so `main.overflow-auto` had nothing to scroll.

**Fix:**
Resolved by the same BUG-002 fix (removing `h-full`). Additionally added `tabIndex={-1}` to `<main>` in AppLayout so the element is focused on click, enabling arrow-key keyboard scroll without placing `<main>` in the Tab order.

---

### BUG-004 — Volume price axis showing persistent label ("50.54" in red)
**Severity:** LOW
**Status:** RESOLVED
**Reported:** 2026-05-19
**Phase:** Phase 4B

**Description:**
The volume price scale was rendering a persistent axis label on the right side of the chart, displaying a volume value in red (e.g., "50.54") at all times regardless of crosshair position.

**Root Cause:**
The volume price scale was visible by default. The `VOLUME_SCALE_OPTIONS` only set `scaleMargins` and `borderVisible` but did not set `visible: false`.

**Fix:**
Added `visible: false, borderVisible: false` to `VOLUME_SCALE_OPTIONS`. Volume value is now surfaced exclusively via the crosshair hover tooltip (absolute-positioned bubble overlay in the chart's top-left corner).

---

### BUG-005 — Infinite re-render loop (Phase 3B)
**Severity:** CRITICAL
**Status:** RESOLVED
**Reported:** 2026-05-18
**Phase:** Phase 3B

**Root Cause:**
Zustand selector `s.klines[symbol]?.[interval] ?? []` returned a new `[]` reference on every render, causing `Object.is` comparison to always fail and triggering continuous re-renders.

**Fix:**
Changed selector to `s.klines[symbol]?.[interval]` (stable `undefined` when absent, no new reference). Guard added in `useEffect`: `if (!candles || candles.length === 0) return`.

---

### BUG-006 — Symbol switch price scale not resetting (Phase 3B)
**Severity:** MEDIUM
**Status:** RESOLVED
**Reported:** 2026-05-18
**Phase:** Phase 3B

**Root Cause:**
On symbol switch, TradingView retained the previous symbol's price scale range, causing the new symbol's candles to be incorrectly scaled or off-screen.

**Fix:**
Added `priceSeries.priceScale().applyOptions({ autoScale: true })` on symbol change (scoped to `isSymbolChange` — not interval or chartType changes which share the same symbol's price range).

---

### BUG-007 — Race condition dropping historical candles (Phase 3B)
**Severity:** HIGH
**Status:** RESOLVED
**Reported:** 2026-05-18
**Phase:** Phase 3B

**Root Cause:**
A live kline WebSocket event arrived before the REST history fetch completed. A single boolean `loadedRef` was set to `true` on the first candle received, causing the component to enter `series.update()` mode with only 1 candle, then silently discard all subsequent history.

**Fix:**
Introduced `historyReadyRef` (gated by `HISTORY_READY_THRESHOLD = 50` candles). REST history always calls `series.setData()` until threshold is met. `series.update()` only activates after full history is confirmed present. Split from `contextRef` which tracks the active rendering context dimensions.

---

### BUG-008 — `fitContent()` running against stale layout (Phase 3B)
**Severity:** LOW
**Status:** RESOLVED
**Reported:** 2026-05-18
**Phase:** Phase 3B

**Root Cause:**
`chart.timeScale().fitContent()` called synchronously after `setData()`. ResizeObserver fires before RAF, so layout dimensions were stale at call time, causing incorrect viewport sizing.

**Fix:**
Wrapped `fitContent()` in `requestAnimationFrame(() => { ... })`. By the time RAF fires, TradingView has measured the container's pixel dimensions.
