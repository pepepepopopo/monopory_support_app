import { getAuthHeaders } from "../../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ApiClientOptions extends Omit<RequestInit, "headers"> {
  auth?: boolean;
  headers?: Record<string, string>;
}

export async function apiClient<T>(
  path: string,
  options?: ApiClientOptions
): Promise<T> {
  const { auth = false, headers, ...rest } = options ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? getAuthHeaders() : {}),
      ...headers,
    },
    ...rest,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `API Error: ${res.status}`);
  }
  return res.json();
}
