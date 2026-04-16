import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function keysToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(keysToCamel)
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Blob)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelCase(k), keysToCamel(v)])
    )
  }
  return obj
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: {
    indexes: null,
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && !(res.data instanceof Blob)) {
      res.data = keysToCamel(res.data)
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  }
)
