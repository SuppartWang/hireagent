import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@hireagent/shared'
import { authApi } from '../api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string, displayName?: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(email, password)
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },
      register: async (email, password, username, displayName) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.register(email, password, username, displayName)
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ token: state.token, user: state.user }) as any }
  )
)
