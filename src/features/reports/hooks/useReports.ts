import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, ReportResponseData, ReportQueryParams, User } from '../../../types/api';

export const useReportData = (params: ReportQueryParams) => {
  return useQuery<ReportResponseData>({
    queryKey: ['reports', 'summary', params],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'ALL') {
          cleanParams[key] = val;
        }
      });

      const response = await apiClient.get<ApiResponse<ReportResponseData>>(
        API_ENDPOINTS.REPORTS.BASE,
        { params: cleanParams }
      );
      return response.data.data;
    },
    staleTime: 10000,
  });
};

export const useReportCashiers = (businessId?: string) => {
  return useQuery<User[]>({
    queryKey: ['reports', 'cashiers', businessId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User[]>>(
        API_ENDPOINTS.REPORTS.CASHIERS,
        { params: businessId ? { businessId } : undefined }
      );
      return response.data.data;
    },
    staleTime: 60000,
  });
};
