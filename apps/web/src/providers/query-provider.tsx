import { QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClient } from '@/lib/query-client'

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  )
}
