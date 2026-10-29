// Single source of truth for talking to the FastAPI backend.
// Every feature module (diseaseApi, recommendationsApi, wellbeingApi,
// hospitalsApi) calls through here, so base URL / error shape only
// ever needs to change in one place.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkError) {
    throw new ApiError(
      "Couldn't reach the CarePulse API. Is the backend running?",
      0
    );
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const detail = body?.detail || `Request failed (${response.status})`;
    throw new ApiError(detail, response.status);
  }

  return body;
}

export function get(path) {
  return request(path, { method: "GET" });
}

export function post(path, payload) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
