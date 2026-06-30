import { apiClient, tokenStore } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, LoginResult, RefreshResult } from '../types/api';
import { LoginInput } from '../features/auth/schemas';

export const authService = {
  login: async (input: LoginInput): Promise<LoginResult> => {
    const response = await apiClient.post<ApiResponse<LoginResult>>(
      API_ENDPOINTS.AUTH.LOGIN,
      input
    );
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Store tokens
    tokenStore.setAccessToken(accessToken);
    tokenStore.setRefreshToken(refreshToken);
    
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.error('Logout API request failed:', error);
    } finally {
      tokenStore.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  refresh: async (refreshToken: string): Promise<RefreshResult> => {
    const response = await apiClient.post<ApiResponse<RefreshResult>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    const { accessToken } = response.data.data;
    tokenStore.setAccessToken(accessToken);
    return response.data.data;
  },
};
