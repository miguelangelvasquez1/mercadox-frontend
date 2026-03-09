export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'CONSUMER' | 'SELLER' | 'ADMIN';

export interface LoginResponse {
  accessToken: string;
  role: UserRole;
}

export interface RecoverPasswordRequest {
  email: string;
}

export interface RecoverPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}