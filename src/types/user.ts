export interface User { id: string; email: string; username: string; avatar_id: string | null }
export interface AuthUser { id: string; email: string; username: string }
export type UserSortField = 'username' | 'email' | 'created_at'
export type SortOrder = 'asc' | 'desc'
export interface UserListQuery { search?: string; sortBy: UserSortField; sortOrder: SortOrder; page: number; limit: number }
export interface UserListResponse { items: User[]; pagination: { page: number; limit: number; total: number; total_pages: number } }
