import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { pinia } from '../pinia'
import { router } from '../router'
import { useAuthStore } from '../stores/auth'
import type { ApiErrorResponse } from '../types/auth'

const TOKEN_KEY = 'access_token'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Current API uses HttpOnly cookies. Bearer support is for deployments that
  // explicitly return a token in a future API version.
  const auth = useAuthStore(pinia)
  const token = auth.token || localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

let handlingUnauthorized = false
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse | string>) => {
    const requestUrl = error.config?.url ?? ''
    if (error.response?.status === 401 && !requestUrl.endsWith('/auth/logout') && !handlingUnauthorized) {
      handlingUnauthorized = true
      try {
        await useAuthStore(pinia).logout({ redirect: false })
        if (router.currentRoute.value.name !== 'login') await router.replace({ name: 'login' })
      } finally {
        handlingUnauthorized = false
      }
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse | string>(error)) return fallback
  const data = error.response?.data
  const message = typeof data === 'string' ? data.trim() : data?.message ?? data?.error
  if (!message) return fallback
  if (message === 'invalid email or password') return 'Неверный email или пароль.'
  if (message === 'failed to register user') return 'Не удалось создать аккаунт. Возможно, email или имя уже заняты.'
  if (message === 'invalid request data') return 'Проверьте корректность введённых данных.'
  return message
}
