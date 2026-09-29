import type { AuthUser } from './user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  username: string
}

/** Current Go API returns AuthUser and sets the JWT as an HttpOnly cookie.
 * The optional fields allow an API version to migrate to an explicit token response.
 */
export interface AuthResponse extends AuthUser {
  token?: string
  access_token?: string
}

export interface ApiErrorResponse {
  message?: string
  error?: string
}
