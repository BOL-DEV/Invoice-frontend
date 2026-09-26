import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, SubscriptionDetails, BusinessDomain } from '../../../types/api';

export const useSubscription = () => {
  return useQuery<SubscriptionDetails>({
    queryKey: ['subscription', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SubscriptionDetails>>(API_ENDPOINTS.SUBSCRIPTIONS.ME);
      return response.data.data;
    },
  });
};

export const useAddCustomDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiClient.post<ApiResponse<BusinessDomain>>(
        API_ENDPOINTS.SUBSCRIPTIONS.DOMAINS,
        { domain }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
    },
  });
};

export const useRemoveCustomDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(
        API_ENDPOINTS.SUBSCRIPTIONS.REMOVE_DOMAIN(domainId)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
    },
  });
};
