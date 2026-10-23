import { apiClient } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, Branch } from '../types/api';

export interface CreateBranchPayload {
  name: string;
  code?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  isMain?: boolean;
  isActive?: boolean;
}

export interface UpdateBranchPayload {
  name?: string;
  code?: string | null;
  address?: string;
  phone?: string | null;
  email?: string | null;
  isMain?: boolean;
  isActive?: boolean;
}

export interface CreateBranchWithHeadPayload {
  branch: {
    name: string;
    address: string;
    code?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  headManager: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export const branchService = {
  list: async (): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(
      API_ENDPOINTS.BRANCHES.BASE
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Branch> => {
    const response = await apiClient.get<ApiResponse<Branch>>(
      API_ENDPOINTS.BRANCHES.DETAIL(id)
    );
    return response.data.data;
  },

  create: async (payload: CreateBranchPayload): Promise<Branch> => {
    const response = await apiClient.post<ApiResponse<Branch>>(
      API_ENDPOINTS.BRANCHES.BASE,
      payload
    );
    return response.data.data;
  },

  createWithHead: async (
    payload: CreateBranchWithHeadPayload
  ): Promise<{ branch: Branch; manager: any }> => {
    const response = await apiClient.post<
      ApiResponse<{ branch: Branch; manager: any }>
    >(API_ENDPOINTS.BRANCHES.WITH_HEAD, payload);
    return response.data.data;
  },

  update: async (id: string, payload: UpdateBranchPayload): Promise<Branch> => {
    const response = await apiClient.patch<ApiResponse<Branch>>(
      API_ENDPOINTS.BRANCHES.DETAIL(id),
      payload
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<{ deleted: boolean; message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; message: string }>>(
      API_ENDPOINTS.BRANCHES.DETAIL(id)
    );
    return response.data.data;
  },
};
