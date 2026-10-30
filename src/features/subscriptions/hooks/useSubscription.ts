import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, SubscriptionDetails, BusinessDomain } from '../../../types/api';

export interface PaymentInitiationResult {
  paymentId: string;
  transactionReference: string;
  amount: number;
  currency: string;
  plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresAt: string;
}

export const useSubscription = () => {
  return useQuery<SubscriptionDetails>({
    queryKey: ['subscription', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SubscriptionDetails>>(API_ENDPOINTS.SUBSCRIPTIONS.ME);
      return response.data.data;
    },
  });
};

export const useInitiateSubscriptionPayment = () => {
  return useMutation({
    mutationFn: async (params: { plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE'; billingCycle: 'MONTHLY' | 'ANNUAL' }) => {
      const response = await apiClient.post<ApiResponse<PaymentInitiationResult>>(
        API_ENDPOINTS.SUBSCRIPTIONS.INITIATE_PAYMENT,
        params
      );
      return response.data.data;
    },
  });
};

export const useVerifySubscriptionPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reference: string) => {
      const response = await apiClient.get<ApiResponse<{ status: string; paid: boolean; message?: string }>>(
        API_ENDPOINTS.SUBSCRIPTIONS.VERIFY_PAYMENT(reference)
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data?.paid) {
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        queryClient.invalidateQueries({ queryKey: ['business'] });
      }
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
};
