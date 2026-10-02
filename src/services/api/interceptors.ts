import { apiClient, tokenStore } from './axios';
import { API_ENDPOINTS } from './endpoints';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = () => {
  // Request Interceptor
  apiClient.interceptors.request.use(
    (config) => {
      const token = tokenStore.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (typeof window !== 'undefined' && config.headers) {
        config.headers['x-tenant-host'] = window.location.host;
        const activeBusinessId = localStorage.getItem('active_business_id');
        if (activeBusinessId) {
          config.headers['x-business-id'] = activeBusinessId;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle suspended cashier account or suspended organization on 403
      if (error.response?.status === 403) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error?.message ||
          '';
        if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('suspended')) {
          tokenStore.clearTokens();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = `/login?reason=suspended&message=${encodeURIComponent(errorMsg)}`;
          }
          return Promise.reject(error);
        }
      }
      
      // Prevent infinite loop if the refresh request itself fails
      if (originalRequest?.url === API_ENDPOINTS.AUTH.REFRESH) {
        tokenStore.clearTokens();
        if (typeof window !== 'undefined') {
          const errorMsg =
            error.response?.data?.message ||
            error.response?.data?.error?.message ||
            '';
          if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('suspended')) {
            window.location.href = `/login?reason=suspended&message=${encodeURIComponent(errorMsg)}`;
          } else {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest?._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenStore.getRefreshToken();
        if (!refreshToken) {
          isRefreshing = false;
          tokenStore.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        try {
          const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
          });

          const newAccessToken = response.data.data.accessToken;
          tokenStore.setAccessToken(newAccessToken);

          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          tokenStore.clearTokens();
          if (typeof window !== 'undefined') {
            const errorMsg =
              refreshError?.response?.data?.message ||
              refreshError?.response?.data?.error?.message ||
              '';
            if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('suspended')) {
              window.location.href = `/login?reason=suspended&message=${encodeURIComponent(errorMsg)}`;
            } else {
              window.location.href = '/login';
            }
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
