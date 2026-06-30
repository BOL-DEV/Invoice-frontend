import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, ActivityLog } from '../../../types/api';

interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useActivityLogs = (page = 1, limit = 50) => {
  return useQuery<ActivityLogsResponse>({
    queryKey: ['activity', 'logs', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ActivityLogsResponse>>(
        API_ENDPOINTS.ACTIVITY.BASE,
        {
          params: { page, limit },
        }
      );
      return response.data.data;
    },
  });
};
