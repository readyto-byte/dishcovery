const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function decodeJwtExp(accessToken) {
  try {
    const part = accessToken.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

/** Exchange refresh_token for a new session; updates localStorage. Returns new access_token or null. */
async function refreshAccessTokenFromApi() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) return null;
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return data.access_token;
  } catch {
    return null;
  }
}

/** Refresh access token when missing or expiring soon. */
async function ensureFreshAccessToken() {
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return access;

  const now = Math.floor(Date.now() / 1000);
  const exp = access ? decodeJwtExp(access) : null;
  if (access && exp && exp > now + 120) {
    return access;
  }

  return (await refreshAccessTokenFromApi()) ?? access;
}

export const apiCall = async (endpoint, options = {}, isRetry = false) => {
  const token = await ensureFreshAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry && localStorage.getItem("refresh_token")) {
    const newAccess = await refreshAccessTokenFromApi();
    if (newAccess) {
      return apiCall(endpoint, options, true);
    }
  }

  if (!response.ok) {
    let backendError = "";
    try {
      const data = await response.json();
      backendError = data?.error || data?.message || "";
    } catch {
      // Ignore JSON parse failures and fall back to status text.
    }
    throw new Error(backendError || `API error: ${response.statusText}`);
  }

  return await response.json();
};

export default API_BASE_URL;
