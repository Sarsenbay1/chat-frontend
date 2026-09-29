import axios from 'axios'
export const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', withCredentials: true, headers: { 'Content-Type': 'application/json' } })
export function getApiError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<string>(error)) return fallback
  const message = error.response?.data?.trim()
  if (!message) return fallback
  if (message === 'invalid email or password') return 'Неверный email или пароль.'
  if (message === 'failed to register user') return 'Не удалось создать аккаунт. Возможно, email или имя уже заняты.'
  if (message === 'invalid request data') return 'Проверьте корректность введённых данных.'
  return message
}
