import { useAuthStore } from '@/store/auth-store';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '../types/api';
import { tokenStorage } from '../utils/tokenStorage';

// Create axios instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authStore = useAuthStore.getState();

// Request interceptor to add auth token
const requestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  try {
    const token = authStore.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Response interceptor to handle token refresh
const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => response,
  onRejected: async (error: AxiosError) => {
    const originalRequest = error.config;
    const token = authStore.getToken();

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 403 Unauthorized errors
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!token?.refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post<AuthResponse>(`${originalRequest.baseURL}/auth/refresh`, {
          refreshToken: token.refreshToken,
        });

        const { accessToken } = response.data;

        // Store new tokens
        authStore.updateToken(response.data);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        await tokenStorage.clearTokens();
        // You can add navigation logic here
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
};

// Add interceptors
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor.onFulfilled, responseInterceptor.onRejected);

export default api;
