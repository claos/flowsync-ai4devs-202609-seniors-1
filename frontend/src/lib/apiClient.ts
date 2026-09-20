interface ApiValidationError {
  message: string;
  field?: string;
  rule?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: ApiValidationError[];

  constructor(message: string, status: number, errors?: ApiValidationError[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export class NetworkError extends Error {}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new NetworkError(
      "No se pudo conectar con el servidor. Verifica tu conexión.",
    );
  }

  if (!response.ok) {
    let errors: ApiValidationError[] | undefined;
    try {
      const data = await response.json();
      if (Array.isArray(data?.errors)) errors = data.errors;
    } catch {
      // el body no era JSON parseable, se ignora y se usa el mensaje genérico
    }
    throw new ApiError(
      errors?.[0]?.message ?? "Ocurrió un error inesperado.",
      response.status,
      errors,
    );
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json();
  // El backend envuelve la mayoría de las respuestas en { data: ... } (ver
  // ApiSerializer en providers/api_provider.ts); algunos endpoints (logout)
  // no lo hacen y se devuelven tal cual.
  return (
    body && typeof body === "object" && "data" in body ? body.data : body
  ) as T;
}

export const apiClient = {
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: "POST", body, token }),
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "GET", token }),
};
