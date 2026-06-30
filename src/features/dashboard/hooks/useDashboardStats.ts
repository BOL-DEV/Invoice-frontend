import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, DashboardStats } from '../../../types/api';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.DASHBOARD.BASE
      );
      return response.data.data;
    },
    refetchInterval: 30000,
  });
};
