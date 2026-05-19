// Standalone CoinGecko REST fetchers.
// Leaf module — not a MarketDataSource. No WebSocket. No store writes.
// Consumed by TanStack Query hooks; store deposits happen in the hook layer.
import type { CoinMeta, GlobalMarketStats, TopMoverCoin } from '@/types/metadata'

const REST_BASE = 'https://api.coingecko.com/api/v3'

// Top 100 coins by market cap — covers all default watchlist items.
// Used by useMetadataEnrichment to populate useMarketStore.coinMetadata.
export async function fetchCoinMetadata(): Promise<CoinMeta[]> {
  const url =
    `${REST_BASE}/coins/markets` +
    `?vs_currency=usd&order=market_cap_desc&per_page=100&page=1` +
    `&sparkline=false&locale=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CoinGecko /coins/markets ${res.status}`)
  const raw: {
    id: string
    symbol: string
    name: string
    image: string
    market_cap_rank: number
  }[] = await res.json()
  return raw.map(c => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    logoUrl: c.image,
    marketCapRank: c.market_cap_rank ?? 9999,
  }))
}

// Global market stats — BTC dominance, total market cap, 24h change.
// Used by Phase 4B market overview panel.
export async function fetchGlobalStats(): Promise<GlobalMarketStats> {
  const res = await fetch(`${REST_BASE}/global`)
  if (!res.ok) throw new Error(`CoinGecko /global ${res.status}`)
  const { data }: {
    data: {
      total_market_cap: Record<string, number>
      market_cap_percentage: Record<string, number>
      market_cap_change_percentage_24h_usd: number
    }
  } = await res.json()
  return {
    totalMarketCapUsd: data.total_market_cap['usd'] ?? 0,
    btcDominancePct: data.market_cap_percentage['btc'] ?? 0,
    marketCapChange24hPct: data.market_cap_change_percentage_24h_usd ?? 0,
  }
}

// Shared response shape for top gainers and top losers endpoints.
type RawMoverCoin = {
  id: string
  symbol: string
  name: string
  image: string
  market_cap_rank: number
  price_change_percentage_24h: number
  current_price: number
}

function mapMoverCoin(c: RawMoverCoin): TopMoverCoin {
  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    logoUrl: c.image,
    marketCapRank: c.market_cap_rank ?? 9999,
    changePct24h: c.price_change_percentage_24h ?? 0,
    priceUsd: c.current_price ?? 0,
  }
}

// Fetches a broad market cap universe and derives top gainers + losers client-side.
//
// Why not use order=price_change_percentage_24h_desc/asc on the CoinGecko free tier?
// The free-tier endpoint ignores that order param and returns market-cap-ranked results
// regardless, causing both gainers and losers lists to show the same large-cap coins.
//
// Fix: fetch top `universeSize` coins by market cap (the reliable ordering), then sort
// the result ourselves by 24h change. Filter: only genuinely positive coins as gainers,
// only genuinely negative coins as losers — they will never share a coin.
export async function fetchMarketMovers(
  universeSize: number,
  topN: number
): Promise<{ gainers: TopMoverCoin[]; losers: TopMoverCoin[] }> {
  const url =
    `${REST_BASE}/coins/markets` +
    `?vs_currency=usd&order=market_cap_desc&per_page=${universeSize}&page=1` +
    `&sparkline=false&price_change_percentage=24h&locale=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CoinGecko /coins/markets (movers) ${res.status}`)
  const coins = ((await res.json()) as RawMoverCoin[]).map(mapMoverCoin)

  const gainers = [...coins]
    .filter(c => c.changePct24h > 0)
    .sort((a, b) => b.changePct24h - a.changePct24h)
    .slice(0, topN)

  const losers = [...coins]
    .filter(c => c.changePct24h < 0)
    .sort((a, b) => a.changePct24h - b.changePct24h)
    .slice(0, topN)

  return { gainers, losers }
}
