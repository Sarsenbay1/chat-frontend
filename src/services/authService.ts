import { axiosInstance } from './axiosInstance'
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials)
    return data
  },
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/register', credentials)
    return data
  },
  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout')
  },
}
