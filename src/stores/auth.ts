import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth'
import type { AuthUser } from '../types/user'

const TOKEN_KEY = 'access_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const initialized = ref(false)
  const isAuthenticated = computed(() => Boolean(user.value))

  function acceptAuthResponse(response: AuthResponse): void {
    user.value = { id: response.id, email: response.email, username: response.username }
    const receivedToken = response.access_token ?? response.token
    if (receivedToken) {
      token.value = receivedToken
      localStorage.setItem(TOKEN_KEY, receivedToken)
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await authService.login(credentials)
    acceptAuthResponse(response)
    initialized.value = true
  }

  async function register(credentials: RegisterCredentials): Promise<void> {
    const response = await authService.register(credentials)
    acceptAuthResponse(response)
    initialized.value = true
  }

  async function restoreSession(): Promise<void> {
    if (initialized.value) return
    try {
      user.value = await userService.getCurrent()
    } catch {
      user.value = null
      token.value = null
      localStorage.removeItem(TOKEN_KEY)
    } finally {
      initialized.value = true
    }
  }

  async function logout(options: { redirect?: boolean } = {}): Promise<void> {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    initialized.value = true
    try {
      await authService.logout()
    } catch {
      // Local credentials are cleared even when the API is unreachable.
    }
    if (options.redirect !== false) {
      const { router } = await import('../router')
      if (router.currentRoute.value.name !== 'login') await router.replace({ name: 'login' })
    }
  }

  return { user, token, initialized, isAuthenticated, login, register, restoreSession, logout }
})
