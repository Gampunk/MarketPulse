import { useQuery } from '@tanstack/react-query'
import { useMarketStore } from '@/stores/market'
import { fetchCoinMetadata } from '@/api/rest/coingecko'

// Fetches top 100 CoinGecko coins and deposits into useMarketStore.coinMetadata.
// Side-effect hook — returns nothing. Called once from App.tsx at app root level.
// Consumers read from useMarketStore(s => s.getCoinMeta(symbol)).
export function useMetadataEnrichment() {
  const setCoinMetadata = useMarketStore(s => s.setCoinMetadata)

  useQuery({
    queryKey: ['coin-metadata'],
    queryFn: async () => {
      const entries = await fetchCoinMetadata()
      setCoinMetadata(entries)
      return entries
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
