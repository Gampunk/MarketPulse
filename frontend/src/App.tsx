import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { usePriceStream } from '@/hooks/usePriceStream'
import { useMetadataEnrichment } from '@/hooks/useMetadataEnrichment'
import { useAnalyticsOrchestrator } from '@/hooks/useAnalyticsOrchestrator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

// AppCore runs inside QueryClientProvider — all app-level side-effect hooks go here.
function AppCore() {
  usePriceStream()
  useMetadataEnrichment()
  useAnalyticsOrchestrator()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppCore />
    </QueryClientProvider>
  )
}

export default App
