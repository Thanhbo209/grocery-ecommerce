import { request } from "@/lib/request";
import type { Address, AddressPayload, UserProfile } from "@/types/auth";

export const userApi = {
  getProfile: () => request<UserProfile>("/api/users/me"),

  getAddresses: () => request<Address[]>("/api/users/me/addresses"),

  updateProfile: (body: { name?: string; phone?: string }) =>
    request<UserProfile>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<void>("/api/users/me/password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  addAddress: (body: AddressPayload) =>
    request<Address[]>("/api/users/me/addresses", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAddress: (addressId: string, body: AddressPayload) =>
    request<Address[]>(`/api/users/me/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteAddress: (addressId: string) =>
    request<Address[]>(`/api/users/me/addresses/${addressId}`, {
      method: "DELETE",
    }),

  setDefaultAddress: (addressId: string) =>
    request<Address[]>(`/api/users/me/addresses/${addressId}/default`, {
      method: "PATCH",
    }),
};
