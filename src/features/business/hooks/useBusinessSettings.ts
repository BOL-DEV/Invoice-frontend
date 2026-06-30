import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, BusinessSettings } from '../../../types/api';

export const useBusinessSettings = () => {
  return useQuery<BusinessSettings>({
    queryKey: ['business', 'settings'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BusinessSettings>>(API_ENDPOINTS.BUSINESS.BASE);
      return response.data.data;
    },
  });
};

export const useUpdateBusinessSettings = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BusinessSettings>) => {
      const response = await apiClient.put<ApiResponse<BusinessSettings>>(
        API_ENDPOINTS.BUSINESS.DETAIL(id),
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'settings'] });
    },
  });
};
