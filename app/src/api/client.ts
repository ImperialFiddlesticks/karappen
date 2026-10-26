const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = RequestInit & { token?: string | null };

export async function apiFetch<T>(
  path: string,
  { token, headers, ...options }: Options = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("Kunde inte nå servern. Kontrollera din anslutning.", 0);
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error ?? "Något gick fel", res.status);
  }
  return data as T;
}

export function toAbsoluteUrl(path: string) {
  return `${API_URL}${path}`;
}
