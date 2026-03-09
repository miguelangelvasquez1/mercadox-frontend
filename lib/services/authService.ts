import { apiClient } from "./apiClient";
import type {
  LoginRequest,
  LoginResponse,
  RecoverPasswordRequest,
  RecoverPasswordResponse,
  ResetPasswordRequest
} from "../types/auth.types";
import { User } from "../types/user.types";

export const authService = {
  /**
   * Authenticate user and store tokens
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercadox_token', response.accessToken);
    }
    return response;
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mercadox_token');
        localStorage.removeItem('mercadox_refresh_token');
      }
    }
  },

  /**
   * Check if user is authenticated (client-side)
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('mercadox_token');
  },
};