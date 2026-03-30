const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getHeaders() {
  const token =
    localStorage.getItem("token") ?? localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...getHeaders(), ...init?.headers },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "Có lỗi xảy ra");
  return json;
}
