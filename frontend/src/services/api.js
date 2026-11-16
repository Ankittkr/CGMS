import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cgms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
     if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data & format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    if (error.response?.status === 401) {
      // Clear token if expired
      localStorage.removeItem('cgms_token');
      localStorage.removeItem('cgms_user');
    }

    return Promise.reject(message);
  }
);

export default api;
