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

export interface Address {
  _id: string;
  label?: string;
  street: string;
  district?: string;
  city: string;
  isDefault: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  addresses: Address[];
  createdAt: string;
}

export interface AddressPayload {
  label?: string;
  street: string;
  district?: string;
  city: string;
  isDefault?: boolean;
}
