import axios, { AxiosError } from "axios";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import config from '../config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}

let refreshTimer: NodeJS.Timeout | undefined;
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const scheduleTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const refreshTime = 79 * 60 * 60 * 1000;
  try {
    refreshTimer = setTimeout(async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await axios.post<RefreshTokenResponse>(
            `${config.API_URL}/auth/refresh`,
            { refreshToken },
            { validateStatus: (status) => status < 500 }
          );
          if (refreshRes.data) {
            localStorage.setItem("token", refreshRes.data.access_token);
            localStorage.setItem("refreshToken", refreshRes.data.refresh_token);
            processQueue(null, refreshRes.data.access_token);
          }
        } catch (error) {
          console.error(
            "Refresh error:",
            (error as AxiosError).message,
            (error as AxiosError).response?.data || error
          );
          processQueue(error as AxiosError, null);
          localStorage.clear();
          window.location.href = "/login";
        } finally {
          isRefreshing = false;
          scheduleTokenRefresh();
        }
      } else {
        scheduleTokenRefresh();
      }
    }, refreshTime);
  } catch (error) {
    console.error("Failed to set timer:", error);
  }
};

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      try {
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshRes = await axios.post<RefreshTokenResponse>(
          `${config.API_URL}/auth/refresh`,
          { refreshToken },
          { validateStatus: (status) => status < 500 }
        );

        if (refreshRes.status === 200) {
          localStorage.setItem("token", refreshRes.data.access_token);
          localStorage.setItem("refreshToken", refreshRes.data.refresh_token);
          processQueue(null, refreshRes.data.access_token);
          scheduleTokenRefresh();
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshRes.data.access_token}`;
          return api(originalRequest);
        } else {
          console.warn(
            "401 Refresh failed, status:",
            refreshRes.status,
            refreshRes.data
          );
          return Promise.reject(new Error("Refresh failed"));
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 5000);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const startTokenRefresh = () => {
  if (localStorage.getItem("token") && localStorage.getItem("refreshToken")) {
    scheduleTokenRefresh();
  } else {
    scheduleTokenRefresh();
  }
};

export const handleLoginSuccess = (
  accessToken: string,
  refreshToken: string
) => {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  startTokenRefresh();
};

export default api;
