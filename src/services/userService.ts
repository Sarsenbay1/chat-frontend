import { axiosInstance } from './axiosInstance'
import type { User, UserListQuery, UserListResponse } from '../types/user'

export const userService = {
  async getCurrent(): Promise<User> {
    const { data } = await axiosInstance.get<User>('/users/me')
    return data
  },

  async list(query: UserListQuery, signal?: AbortSignal): Promise<UserListResponse> {
    const { data } = await axiosInstance.get<UserListResponse>('/users', { params: query, signal })
    return data
  },
}
