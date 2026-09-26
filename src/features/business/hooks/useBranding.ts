import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, TenantBranding } from '../../../types/api';

export const useBranding = () => {
  return useQuery<TenantBranding>({
    queryKey: ['business', 'branding'],
    queryFn: async () => {
      const host = typeof window !== 'undefined' ? window.location.host : '';
      const response = await apiClient.get<ApiResponse<TenantBranding>>(
        `${API_ENDPOINTS.BUSINESS.BRANDING}?host=${encodeURIComponent(host)}`
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
