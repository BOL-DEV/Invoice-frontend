import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse, TenantSummary, OnboardTenantInput, PlanType, BillingMode } from '../../../types/api';

export const useTenantsList = () => {
  return useQuery<TenantSummary[]>({
    queryKey: ['admin', 'tenants'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TenantSummary[]>>(API_ENDPOINTS.BUSINESS.ADMIN_ALL);
      return response.data.data;
    },
  });
};

export const useOnboardTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OnboardTenantInput) => {
      const response = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.BUSINESS.ADMIN_ONBOARD, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
};

export const useUpdateTenantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, onboardingStatus }: { id: string; onboardingStatus: string }) => {
      const response = await apiClient.put<ApiResponse<any>>(
        API_ENDPOINTS.BUSINESS.ADMIN_STATUS(id),
        { onboardingStatus }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
};

export const useUpdateTenantPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      data,
    }: {
      businessId: string;
      data: {
        plan?: PlanType;
        billingMode?: BillingMode;
        maxStaffCount?: number;
        hasCustomDomain?: boolean;
        hasMultipleBranches?: boolean;
        hasAdvancedReports?: boolean;
      };
    }) => {
      const response = await apiClient.put<ApiResponse<any>>(
        API_ENDPOINTS.SUBSCRIPTIONS.UPDATE_PLAN(businessId),
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};
