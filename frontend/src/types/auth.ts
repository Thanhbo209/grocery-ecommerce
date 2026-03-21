// types/auth.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}
