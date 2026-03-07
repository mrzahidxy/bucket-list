export class RequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const apiFetch = async <T>(
  url: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const body = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { message: string };
  } | null;

  if (!response.ok) {
    throw new RequestError(
      response.status,
      body?.error?.message ?? "Request failed",
    );
  }

  return body?.data as T;
};
