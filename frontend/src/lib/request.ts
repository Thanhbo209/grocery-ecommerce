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

  // Đọc body 1 lần dưới dạng text để dùng được cho cả error và parse
  const raw = await res.text();

  // Parse JSON — bắt lỗi nếu body rỗng hoặc không phải JSON (HTML, plain text...)
  let json: Record<string, unknown> | null = null;
  try {
    json = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    // Body không phải JSON — nếu res không ok thì báo lỗi rõ ràng
    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status} ${res.statusText}${raw ? `: ${raw.slice(0, 200)}` : ""}`,
      );
    }
    // res.ok nhưng body không parse được — không bình thường
    throw new Error(
      `Phản hồi không hợp lệ từ server (${res.status}): ${raw.slice(0, 200)}`,
    );
  }

  // Non-2xx response với JSON body — ưu tiên message từ server
  if (!res.ok) {
    const msg =
      (json?.message as string) ||
      (json?.error as string) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // 2xx nhưng success: false — lỗi nghiệp vụ từ API
  if (json && json.success === false) {
    throw new Error((json.message as string) ?? "Có lỗi xảy ra");
  }

  return json as { data: T };
}
