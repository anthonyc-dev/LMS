import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies
});

// Request interceptor to add auth token from memory
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the HttpOnly cookie
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const { token } = response.data;
        useAuthStore.getState().setToken(token);

        // Update the original request header and retry
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
