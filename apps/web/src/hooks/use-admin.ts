import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'

const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const { data } = await adminApi.stats()
      return data as any
    },
  })
}

export function useRecalculateRankings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await adminApi.recalculateRankings()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useFeatureAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      await adminApi.featureAgent(id, featured)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      // Also invalidate agent lists since featured status affects them
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}
