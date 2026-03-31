// types/auth.ts
export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}
