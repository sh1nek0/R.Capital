import type { UserRole } from "@capital-os/shared";

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthUserView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUserView;
}

