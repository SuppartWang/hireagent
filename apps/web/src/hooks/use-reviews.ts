import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '@/api'

const reviewKeys = {
  all: ['reviews'] as const,
  agent: (agentId: string) => [...reviewKeys.all, 'agent', agentId] as const,
}

export function useReviews(agentId: string) {
  return useQuery({
    queryKey: reviewKeys.agent(agentId),
    queryFn: async () => {
      const { data } = await reviewsApi.list(agentId)
      return data as any[]
    },
    enabled: !!agentId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      agentId,
      payload,
    }: {
      agentId: string
      payload: { rating: number; commentZh?: string; commentEn?: string }
    }) => {
      const { data } = await reviewsApi.create(agentId, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.agent(variables.agentId) })
    },
  })
}
