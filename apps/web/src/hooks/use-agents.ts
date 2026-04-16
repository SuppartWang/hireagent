import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AgentFilters, AgentListItem, Agent } from '@hireagent/shared'
import { agentsApi } from '@/api'

const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: AgentFilters = {}) => [...agentKeys.lists(), filters] as const,
  featured: () => [...agentKeys.all, 'featured'] as const,
  trending: () => [...agentKeys.all, 'trending'] as const,
  stats: () => [...agentKeys.all, 'stats'] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (slug: string) => [...agentKeys.details(), slug] as const,
}

export function useAgents(filters?: AgentFilters) {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: async () => {
      const { data } = await agentsApi.list(filters)
      return data
    },
  })
}

export function useFeaturedAgents() {
  return useQuery({
    queryKey: agentKeys.featured(),
    queryFn: async () => {
      const { data } = await agentsApi.featured()
      return data
    },
  })
}

export function useTrendingAgents() {
  return useQuery({
    queryKey: agentKeys.trending(),
    queryFn: async () => {
      const { data } = await agentsApi.trending()
      return data
    },
  })
}

export function useAgent(slug: string) {
  return useQuery({
    queryKey: agentKeys.detail(slug),
    queryFn: async () => {
      const { data } = await agentsApi.getBySlug(slug)
      return data
    },
    enabled: !!slug,
  })
}

export function usePlatformStats() {
  return useQuery({
    queryKey: agentKeys.stats(),
    queryFn: async () => {
      const { data } = await agentsApi.platformStats()
      return data as { totalAgents: number; totalUsers: number; totalHires: number }
    },
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Agent>) => {
      const { data } = await agentsApi.create(payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Agent> }) => {
      const { data } = await agentsApi.update(id, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.details() })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}

export function usePublishAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await agentsApi.publish(id)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.details() })
    },
  })
}

export function useHireAgent() {
  return useMutation({
    mutationFn: async ({ id, hireType }: { id: string; hireType: string }) => {
      await agentsApi.hire(id, hireType)
    },
  })
}

export function useBookmarkAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await agentsApi.bookmark(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}
