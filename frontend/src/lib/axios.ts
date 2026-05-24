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

    // ✅ Skip auth endpoints
    const excludedRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
    ];

    const shouldSkipRefresh = excludedRoutes.some((route) =>
      originalRequest.url?.includes(route)
    );

    // ✅ Only refresh on protected routes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      originalRequest._retry = true;

      try {
        // 🔥 Refresh using HttpOnly cookie
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        // ✅ Update the in-memory token
        const newToken = refreshResponse.data.result.accessToken;
        useAuthStore.getState().setToken(newToken);

        // ✅ Retry original request with fresh token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
