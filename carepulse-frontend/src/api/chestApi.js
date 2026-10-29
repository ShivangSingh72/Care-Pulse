import { API_BASE_URL, ApiError } from "./client";

export async function predictChestImage(file) {
  const formData = new FormData();

  formData.append("file", file);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/predict-chest`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
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
    const detail =
      body?.detail || `Request failed (${response.status})`;

    throw new ApiError(detail, response.status);
  }

  return body;
}