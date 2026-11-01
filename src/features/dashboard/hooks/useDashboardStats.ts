import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, DashboardStats } from '../../../types/api';

export const useDashboardStats = (branchId?: string) => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', branchId || 'all'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.DASHBOARD.BASE,
        {
          params: branchId && branchId !== 'all' ? { branchId } : {},
        }
      );
      return response.data.data;
    },
    refetchInterval: 30000,
  });
};
