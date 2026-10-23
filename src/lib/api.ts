/**
 * fetch() against the backend, with the API key it requires. Server-side
 * only: API_KEY is not a NEXT_PUBLIC_ var, so it never reaches the browser.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("X-API-Key", process.env.API_KEY ?? "");
  return fetch(`${process.env.API_URL}${path}`, { ...init, headers });
}
