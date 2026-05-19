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

// Top movers by 24h price change — sorted desc for gainers, asc for losers.
// Used by Phase 4B market overview panel.
export async function fetchTopMovers(limit: number): Promise<TopMoverCoin[]> {
  const url =
    `${REST_BASE}/coins/markets` +
    `?vs_currency=usd&order=price_change_percentage_24h_desc` +
    `&per_page=${limit * 2}&page=1&sparkline=false` +
    `&price_change_percentage=24h&locale=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CoinGecko /coins/markets (movers) ${res.status}`)
  const raw: {
    id: string
    symbol: string
    name: string
    image: string
    market_cap_rank: number
    price_change_percentage_24h: number
    current_price: number
  }[] = await res.json()
  return raw.map(c => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    logoUrl: c.image,
    marketCapRank: c.market_cap_rank ?? 9999,
    changePct24h: c.price_change_percentage_24h ?? 0,
    priceUsd: c.current_price ?? 0,
  }))
}
