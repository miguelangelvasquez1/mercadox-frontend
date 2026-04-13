export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'CONSUMER' | 'ADMIN';

export interface LoginResponse {
  accessToken: string;
  role: UserRole;
}

// --- Registro ---
export interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
}

// --- Recuperar contraseña ---
export interface ForgotPasswordRequest {
  email: string;
}

// --- Reset contraseña ---
export interface ResetPasswordRequest {
  token: string;
  newPassword: string; // Debe coincidir con el record del back
}