import { useEffect } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useMarketStore } from '@/stores/market'
import { fetchMarketMovers, fetchGlobalStats } from '@/api/rest/coingecko'

// Shared refresh cadence for all analytics queries.
// 15 min: 2 endpoints × 4/hr = 8 analytics req/hr + 1 metadata/hr = 9/hr total (~216/day).
// Well within CoinGecko free tier (~500 req/day).
const ANALYTICS_REFRESH_MS = 15 * 60 * 1000

// Manages all CoinGecko analytics polling for the lifetime of the app.
// Called once from AppCore — above the route tree alongside usePriceStream
// and useMetadataEnrichment. Components never poll CoinGecko directly.
//
// Data flow: CoinGecko REST → queryFn → Zustand analytics slice → UI reads store.
// lastRefreshedAt fires after both queries complete a cycle — designed hook point
// for future AI narrative systems.
export function useAnalyticsOrchestrator() {
  const setTopGainers = useMarketStore(s => s.setTopGainers)
  const setTopLosers = useMarketStore(s => s.setTopLosers)
  const setGlobalStats = useMarketStore(s => s.setGlobalStats)
  const setAnalyticsLastRefreshed = useMarketStore(s => s.setAnalyticsLastRefreshed)

  const [moversQ, statsQ] = useQueries({
    queries: [
      {
        queryKey: ['analytics', 'market-movers'],
        queryFn: async () => {
          // Fetch top-200 market cap universe; derive gainers/losers client-side.
          // This avoids the CoinGecko free-tier bug where price_change ordering is ignored.
          const { gainers, losers } = await fetchMarketMovers(200, 5)
          setTopGainers(gainers)
          setTopLosers(losers)
          return { gainers, losers }
        },
        staleTime: ANALYTICS_REFRESH_MS,
        refetchInterval: ANALYTICS_REFRESH_MS,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['analytics', 'global-stats'],
        queryFn: async () => {
          const data = await fetchGlobalStats()
          setGlobalStats(data)
          return data
        },
        staleTime: ANALYTICS_REFRESH_MS,
        refetchInterval: ANALYTICS_REFRESH_MS,
        refetchOnWindowFocus: false,
      },
    ],
  })

  // Update lastRefreshedAt when both queries have completed a cycle.
  useEffect(() => {
    if (!moversQ.isSuccess || !statsQ.isSuccess) return
    const latest = Math.max(moversQ.dataUpdatedAt, statsQ.dataUpdatedAt)
    setAnalyticsLastRefreshed(latest)
  }, [
    moversQ.isSuccess,
    statsQ.isSuccess,
    moversQ.dataUpdatedAt,
    statsQ.dataUpdatedAt,
    setAnalyticsLastRefreshed,
  ])
}
