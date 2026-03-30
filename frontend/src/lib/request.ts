const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getHeaders() {
  const token =
    localStorage.getItem("token") ?? localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...getHeaders(), ...init?.headers },
  });

  const rawText = await res.text();

  let json: Record<string, unknown> | null = null;
  try {
    json = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;
  } catch {
    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status} ${res.statusText}${rawText ? `: ${rawText.slice(0, 200)}` : ""}`,
      );
    }
    throw new Error(
      `Phản hồi không hợp lệ từ server (${res.status}): ${rawText.slice(0, 200)}`,
    );
  }

  if (!res.ok) {
    const msg =
      (json?.message as string) ||
      (json?.error as string) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  if (json && json.success === false) {
    throw new Error((json.message as string) ?? "Có lỗi xảy ra");
  }

  return json as T;
}
