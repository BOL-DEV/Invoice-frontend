import { apiClient } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, Waybill, WaybillStatus } from '../types/api';

export interface CreateWaybillInput {
  invoiceId: string;
  customerName?: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  lorryNumber?: string | null;
  deliveredBy?: string | null;
  receivedBy?: string | null;
  lpoNumber?: string | null;
  dispatchDate?: string | null;
  notes?: string | null;
  status?: WaybillStatus;
  items?: {
    position: number;
    description: string;
    quantity: number;
    unit?: string | null;
  }[];
  branchId?: string | null;
}

interface ListWaybillsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: WaybillStatus;
  invoiceId?: string;
  branchId?: string;
}

interface ListWaybillsResponse {
  waybills: Waybill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const waybillService = {
  list: async (params?: ListWaybillsParams): Promise<ListWaybillsResponse> => {
    const response = await apiClient.get<ApiResponse<ListWaybillsResponse>>(
      API_ENDPOINTS.WAYBILLS.BASE,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Waybill> => {
    const response = await apiClient.get<ApiResponse<Waybill>>(
      API_ENDPOINTS.WAYBILLS.DETAIL(id)
    );
    return response.data.data;
  },

  createFromInvoice: async (payload: CreateWaybillInput): Promise<Waybill> => {
    const response = await apiClient.post<ApiResponse<Waybill>>(
      API_ENDPOINTS.WAYBILLS.FROM_INVOICE,
      payload
    );
    return response.data.data;
  },

  update: async (id: string, payload: Partial<CreateWaybillInput>): Promise<Waybill> => {
    const response = await apiClient.put<ApiResponse<Waybill>>(
      API_ENDPOINTS.WAYBILLS.DETAIL(id),
      payload
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.WAYBILLS.DETAIL(id));
  },

  getPDFUrl: (id: string) => API_ENDPOINTS.WAYBILLS.PDF(id),
};
