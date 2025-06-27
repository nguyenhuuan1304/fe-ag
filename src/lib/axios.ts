import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTimer: string | number | NodeJS.Timeout | undefined;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const scheduleTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const refreshTime = 14 * 60 * 1000;
  try {
    refreshTimer = setTimeout(() => {
      // Refresh token is optional, log runs independently
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        axios
          .post(
            "http://localhost:3001/auth/refresh",
            { refreshToken: refreshToken }, // Explicitly name the field
            { validateStatus: (status) => status < 500 }
          )
          .then((refreshRes) => {
            if (refreshRes) {
              localStorage.setItem("token", refreshRes.data.access_token);
              localStorage.setItem(
                "refreshToken",
                refreshRes.data.refresh_token
              );
              processQueue(null, refreshRes.data.access_token);
            }
          })
          .catch((error) => {
            console.error(
              "Refresh error:",
              error.message,
              error.response?.data || error
            );
            processQueue(error, null);
          })
          .finally(() => {
            isRefreshing = false;
            scheduleTokenRefresh(); // Reschedule every 2 minutes
          });
      } else {
        scheduleTokenRefresh(); // Reschedule regardless
      }
    }, refreshTime);
  } catch (error) {
    console.error("Failed to set timer:", error);
  }
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      try {
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshRes = await axios.post(
          "http://localhost:3001/auth/refresh",
          { refreshToken: refreshToken }, // Explicit field name
          { validateStatus: (status) => status < 500 }
        );

        if (refreshRes.status === 200) {
          localStorage.setItem("token", refreshRes.data.access_token);
          localStorage.setItem("refreshToken", refreshRes.data.refresh_token);
          processQueue(null, refreshRes.data.access_token);
          scheduleTokenRefresh();
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${refreshRes.data.access_token}`;
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
        processQueue(refreshError, null);
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
