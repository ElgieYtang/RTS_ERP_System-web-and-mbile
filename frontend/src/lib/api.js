const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
class ApiError extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options?.headers ?? {}
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message : "The Laravel API could not complete this request.";
    throw new ApiError(message, response.status);
  }
  return payload;
}
function fetchSettings() {
  return request("/settings");
}
function saveSettings(data) {
  return request("/settings", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
function savePassword(data) {
  return request("/settings/password", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
export {
  ApiError,
  fetchSettings,
  savePassword,
  saveSettings
};
