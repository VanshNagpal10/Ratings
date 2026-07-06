import axios from 'axios';

// Axios instance pointed at the API. During dev, Vite proxies /api to :4000.
const api = axios.create({ baseURL: '/api' });

// Attach the stored JWT to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise error messages for the UI.
export function apiError(err) {
  return err?.response?.data?.error || err?.message || 'Something went wrong.';
}

export default api;
