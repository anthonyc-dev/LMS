import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { authEventBus } from "./authEventBus";

const baseConfig = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 60000, // 60 seconds timeout to handle third-party API cold starts
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for cookies
};

// The primary API instance for the application
const api = axios.create(baseConfig);

// A separate, pure internal client strictly for background auth operations.
// This prevents interceptor infinite loops and removes the need for custom config hacks.
const authClient = axios.create(baseConfig);

// Mutex lock and queue for concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  // Capture current queue and immediately clear it to prevent race conditions
  // if another request fails while we are resolving these promises.
  const queueToProcess = [...failedQueue];
  failedQueue = [];

  queueToProcess.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
};

// Singleton promise for concurrent CSRF fetches
let csrfPromise: Promise<string> | null = null;

api.interceptors.request.use(
  async (config) => {
    const { token, csrfToken } = useAuthStore.getState();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // Identify if the request requires CSRF protection
    const isSafeMethod = ["get", "head", "options"].includes(
      config.method?.toLowerCase() || "get",
    );

    if (!isSafeMethod) {
      let currentCsrf = csrfToken;

      // Lazy-fetch CSRF token if missing in memory
      if (!currentCsrf) {
        if (!csrfPromise) {
          // Use authClient to avoid interceptor recursion
          csrfPromise = authClient
            .get("/auth/csrf")
            .then((res) => {
              const fetchedToken = res.data.csrfToken;
              useAuthStore.getState().setCsrfToken(fetchedToken);
              return fetchedToken;
            })
            .catch((err) => {
              console.error("Failed to fetch CSRF token", err);
              return "";
            })
            .finally(() => {
              csrfPromise = null;
            });
        }
        currentCsrf = await csrfPromise;
      }

      if (currentCsrf) {
        config.headers.set("x-csrf-token", currentCsrf);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Reject immediately if no config or if it was already retried
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Only intercept 401 Unauthorized errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Debounce: If the user is already logged out locally, don't attempt to refresh.
    // This prevents post-logout ghost requests from spamming the event bus.
    if (!useAuthStore.getState().isAuthenticated) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Suspend concurrent requests while refresh is in progress
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.set("Authorization", `Bearer ${token}`);
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use authClient for pure refresh call (no interceptors)
      const refreshResponse = await authClient.post("/auth/refresh");

      const newToken =
        refreshResponse.data.result?.accessToken ||
        refreshResponse.data.accessToken;

      useAuthStore.getState().setToken(newToken);
      authEventBus.publish("token_refresh");

      processQueue(null, newToken);

      originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      authEventBus.publish("session_expired");
      useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
