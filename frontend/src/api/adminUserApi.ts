import { request } from "@/lib/request";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  isActive: boolean;
  addresses: {
    _id: string;
    label?: string;
    street: string;
    district?: string;
    city: string;
    isDefault: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "user" | "admin";
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  role?: "user" | "admin";
  isActive?: boolean;
}

export const adminUserApi = {
  getAll: (params?: {
    page?: number;
    search?: string;
    role?: "user" | "admin";
    isActive?: boolean;
  }) => {
    const query: Record<string, string> = {};

    if (params?.page) query.page = String(params.page);
    if (params?.search) query.search = params.search;
    if (params?.role) query.role = params.role;
    if (params?.isActive !== undefined)
      query.isActive = String(params.isActive);

    const qs = new URLSearchParams(query).toString();

    return request<UsersResponse>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },
  getById: (id: string) => request<AdminUser>(`/api/admin/users/${id}`),

  create: (body: CreateUserPayload) =>
    request<AdminUser>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: UpdateUserPayload) =>
    request<AdminUser>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  resetPassword: (id: string, newPassword: string) =>
    request<void>(`/api/admin/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ newPassword }),
    }),

  toggleActive: (id: string) =>
    request<AdminUser>(`/api/admin/users/${id}/toggle-active`, {
      method: "PATCH",
    }),

  delete: (id: string) =>
    request<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
};
