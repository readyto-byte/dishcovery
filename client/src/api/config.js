const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
