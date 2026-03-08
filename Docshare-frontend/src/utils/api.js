import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('docshare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry once on network errors (Render free tier cold start can take 30-60s)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError = !error.response;
    if (isNetworkError && !error.config._retried) {
      error.config._retried = true;
      toast.loading('Server is waking up, retrying…', { id: 'cold-start', duration: 10000 });
      // Wait 8 seconds for Render to spin up, then retry
      await new Promise((resolve) => setTimeout(resolve, 8000));
      toast.dismiss('cold-start');
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
