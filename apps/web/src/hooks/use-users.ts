import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api'

const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  myAgents: () => [...userKeys.all, 'myAgents'] as const,
  profile: (username: string) => [...userKeys.all, 'profile', username] as const,
}

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const { data } = await usersApi.me()
      return data
    },
  })
}

export function useMyAgents() {
  return useQuery({
    queryKey: userKeys.myAgents(),
    queryFn: async () => {
      const { data } = await usersApi.myAgents()
      return data as any[]
    },
  })
}

export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: async () => {
      const { data } = await usersApi.publicProfile(username)
      return data
    },
    enabled: !!username,
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await usersApi.updateMe(payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
    },
  })
}
