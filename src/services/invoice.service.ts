import { apiClient } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, Invoice, InvoiceStatus } from '../types/api';
import { InvoiceFormInput } from '../features/invoices/schemas';

interface ListInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
}

interface ListInvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const invoiceService = {
  list: async (params?: ListInvoicesParams): Promise<ListInvoicesResponse> => {
    const response = await apiClient.get<ApiResponse<ListInvoicesResponse>>(
      API_ENDPOINTS.INVOICES.BASE,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(
      API_ENDPOINTS.INVOICES.DETAIL(id)
    );
    return response.data.data;
  },

  create: async (payload: InvoiceFormInput): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      API_ENDPOINTS.INVOICES.BASE,
      payload
    );
    return response.data.data;
  },

  update: async (id: string, payload: InvoiceFormInput): Promise<Invoice> => {
    const response = await apiClient.put<ApiResponse<Invoice>>(
      API_ENDPOINTS.INVOICES.DETAIL(id),
      payload
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVOICES.DETAIL(id));
  },
};
