import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import {
  ApiResponse,
  TenantSummary,
  OnboardTenantInput,
  PlanType,
  BillingMode,
  PlatformOverview,
  TenantFullDetails,
} from '../../../types/api';

export const usePlatformOverview = () => {
  return useQuery<PlatformOverview>({
    queryKey: ['admin', 'platform-overview'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PlatformOverview>>(API_ENDPOINTS.BUSINESS.ADMIN_OVERVIEW);
      return response.data.data;
    },
    refetchInterval: 30000,
  });
};

export const useTenantDetails = (tenantId: string | null) => {
  return useQuery<TenantFullDetails>({
    queryKey: ['admin', 'tenant-details', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID required');
      const response = await apiClient.get<ApiResponse<TenantFullDetails>>(API_ENDPOINTS.BUSINESS.ADMIN_DETAILS(tenantId));
      return response.data.data;
    },
    enabled: Boolean(tenantId),
  });
};

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

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const response = await apiClient.put<ApiResponse<any>>(
        API_ENDPOINTS.BUSINESS.DETAIL(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
    },
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
        newPassword?: string;
      };
    }) => {
      const response = await apiClient.patch<ApiResponse<any>>(
        API_ENDPOINTS.USERS.ADMIN_UPDATE(id),
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details'] });
    },
  });
};

export const useAdminResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(
        API_ENDPOINTS.USERS.ADMIN_RESET_PASSWORD(id),
        { newPassword }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details'] });
    },
  });
};

export const useAdminToggleUserSuspend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<ApiResponse<any>>(
        API_ENDPOINTS.USERS.TOGGLE_SUSPEND(id)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details'] });
    },
  });
};



export const useAddTenantDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      domain,
      isPrimary,
    }: {
      businessId: string;
      domain: string;
      isPrimary?: boolean;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>(
        `/api/subscriptions/admin/${businessId}/domains`,
        { domain, isPrimary }
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
};

export const useRemoveTenantDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      domainId,
    }: {
      businessId: string;
      domainId: string;
    }) => {
      const response = await apiClient.delete<ApiResponse<any>>(
        `/api/subscriptions/admin/${businessId}/domains/${domainId}`
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
};

export const useSetPrimaryTenantDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      domainId,
    }: {
      businessId: string;
      domainId: string;
    }) => {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/api/subscriptions/admin/${businessId}/domains/${domainId}/primary`
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-details', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
};
