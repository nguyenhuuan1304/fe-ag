import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Store the timer reference to clear it later
let refreshTimer: string | number | NodeJS.Timeout | undefined;

// Function to schedule token refresh
const scheduleTokenRefresh = () => {
  // Clear any existing timer to avoid duplicates
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // Set a timer to refresh token after 14 minutes (14 * 60 * 1000 milliseconds)
  const refreshTime = 14 * 60 * 1000; // 14 minutes
  refreshTimer = setTimeout(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const refreshRes = await axios.post(
          "http://localhost:3001/auth/refresh",
          {
            refreshToken,
          }
        );

        // Update tokens in localStorage
        localStorage.setItem("token", refreshRes.data.accessToken);
        localStorage.setItem("refreshToken", refreshRes.data.refreshToken);

        // Schedule the next refresh
        scheduleTokenRefresh();
      } else {
        // No refresh token, redirect to login
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.clear();
      window.location.href = "/login";
    }
  }, refreshTime);
};

// Response interceptor to handle 401 errors
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

      try {
        const refreshRes = await axios.post(
          "http://localhost:3001/auth/refresh",
          {
            refreshToken: localStorage.getItem("refreshToken"),
          }
        );

        // Update tokens
        localStorage.setItem("token", refreshRes.data.accessToken);
        localStorage.setItem("refreshToken", refreshRes.data.refreshToken);

        // Schedule next refresh
        scheduleTokenRefresh();

        // Attach new token to the original request
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${refreshRes.data.accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor to attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Start the refresh cycle when the app initializes (e.g., after login)
export const startTokenRefresh = () => {
  if (localStorage.getItem("token") && localStorage.getItem("refreshToken")) {
    scheduleTokenRefresh();
  }
};

// Function to call after successful login to store tokens and start refresh cycle
export const handleLoginSuccess = (
  accessToken: string,
  refreshToken: string
) => {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  scheduleTokenRefresh();
};

export default api;
