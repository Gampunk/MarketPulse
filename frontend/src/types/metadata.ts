// Coin-level metadata from CoinGecko — separate from Binance market data types.
// Keyed in useMarketStore.coinMetadata by baseAsset uppercase (e.g., 'BTC').

export interface CoinMeta {
  id: string             // CoinGecko slug ('bitcoin')
  symbol: string         // CoinGecko short symbol lowercase ('btc') — matches Binance baseAsset
  name: string           // Display name ('Bitcoin')
  logoUrl: string        // CoinGecko CDN image URL
  marketCapRank: number  // Global rank by market cap
}

export interface GlobalMarketStats {
  totalMarketCapUsd: number
  btcDominancePct: number
  marketCapChange24hPct: number
}

export interface TopMoverCoin {
  id: string
  symbol: string         // CoinGecko symbol lowercase ('btc')
  name: string
  logoUrl: string
  marketCapRank: number
  changePct24h: number
  priceUsd: number
}
