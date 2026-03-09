import type { UserRole } from "./auth.types";

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
}