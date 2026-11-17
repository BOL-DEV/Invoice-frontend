import { apiClient, tokenStore } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, Quotation, QuotationStatus } from '../types/api';

export interface CreateQuotationInput {
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  status?: QuotationStatus;
  notes?: string | null;
  customerSignature?: string | null;
  validUntil?: string | null;
  subtotal: number;
  total: number;
  items: {
    position: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    metrics?: string | null;
  }[];
  branchId?: string | null;
}

interface ListQuotationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  branchId?: string;
}

interface ListQuotationsResponse {
  quotations: Quotation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const quotationService = {
  list: async (params?: ListQuotationsParams): Promise<ListQuotationsResponse> => {
    const response = await apiClient.get<ApiResponse<ListQuotationsResponse>>(
      API_ENDPOINTS.QUOTATIONS.BASE,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Quotation> => {
    const response = await apiClient.get<ApiResponse<Quotation>>(
      API_ENDPOINTS.QUOTATIONS.DETAIL(id)
    );
    return response.data.data;
  },

  create: async (payload: CreateQuotationInput): Promise<Quotation> => {
    const response = await apiClient.post<ApiResponse<Quotation>>(
      API_ENDPOINTS.QUOTATIONS.BASE,
      payload
    );
    return response.data.data;
  },

  update: async (id: string, payload: Partial<CreateQuotationInput>): Promise<Quotation> => {
    const response = await apiClient.put<ApiResponse<Quotation>>(
      API_ENDPOINTS.QUOTATIONS.DETAIL(id),
      payload
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.QUOTATIONS.DETAIL(id));
  },

  convertToInvoice: async (id: string): Promise<{ quotation: Quotation; invoice: any }> => {
    const response = await apiClient.post<ApiResponse<{ quotation: Quotation; invoice: any }>>(
      API_ENDPOINTS.QUOTATIONS.CONVERT(id)
    );
    return response.data.data;
  },

  getPDFUrl: (id: string) => {
    const token = tokenStore.getAccessToken();
    const base = API_ENDPOINTS.QUOTATIONS.PDF(id);
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },
};
