import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'

export function useLogin() {
  const { login } = useAuthStore()
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await login(email, password)
    },
  })
}

export function useRegister() {
  const { register } = useAuthStore()
  return useMutation({
    mutationFn: async (payload: {
      email: string
      password: string
      username: string
      displayName?: string
    }) => {
      await register(payload.email, payload.password, payload.username, payload.displayName)
    },
  })
}
