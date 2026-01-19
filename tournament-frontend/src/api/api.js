import axios from "axios";

// Get the base URL based on environment
const getBaseURL = () => {
  // In production, use the environment variable or relative path
  if (import.meta.env.PROD) {
    // If VITE_API_URL is set in .env.production, use it
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Otherwise use relative path for same-domain deployment
    return '/api';
  }
  // In development, use the configured dev URL
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL()
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
