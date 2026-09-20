export interface User {
  id: number;
  fullName: string | null;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  initials: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string | null;
  email: string;
  password: string;
  passwordConfirmation: string;
}
