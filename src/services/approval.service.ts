import { apiClient } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, ApprovalRequest, ApprovalStatus, ApprovalType } from '../types/api';

interface ListApprovalsParams {
  status?: ApprovalStatus;
}

interface CreateApprovalPayload {
  invoiceId: string;
  type: ApprovalType;
  reason: string;
}

interface ActionApprovalPayload {
  status: 'APPROVED' | 'REJECTED';
  adminNotes?: string | null;
}

export const approvalService = {
  list: async (params?: ListApprovalsParams): Promise<ApprovalRequest[]> => {
    const response = await apiClient.get<ApiResponse<ApprovalRequest[]>>(
      API_ENDPOINTS.APPROVALS.BASE,
      { params }
    );
    return response.data.data;
  },

  create: async (payload: CreateApprovalPayload): Promise<ApprovalRequest> => {
    const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
      API_ENDPOINTS.APPROVALS.BASE,
      payload
    );
    return response.data.data;
  },

  action: async (id: string, payload: ActionApprovalPayload): Promise<ApprovalRequest> => {
    const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
      API_ENDPOINTS.APPROVALS.ACTION(id),
      payload
    );
    return response.data.data;
  },
};
