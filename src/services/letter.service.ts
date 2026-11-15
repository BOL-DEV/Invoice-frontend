import { apiClient } from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse, Letter, LetterStatus } from '../types/api';

export interface CreateLetterInput {
  title: string;
  body: string;
  ourRef?: string | null;
  yourRef?: string | null;
  date?: string | null;
  recipientName?: string | null;
  recipientAddress?: string | null;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
  status?: LetterStatus;
  branchId?: string | null;
}

interface ListLettersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LetterStatus;
  branchId?: string;
}

interface ListLettersResponse {
  letters: Letter[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const letterService = {
  list: async (params?: ListLettersParams): Promise<ListLettersResponse> => {
    const response = await apiClient.get<ApiResponse<ListLettersResponse>>(
      API_ENDPOINTS.LETTERS.BASE,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Letter> => {
    const response = await apiClient.get<ApiResponse<Letter>>(
      API_ENDPOINTS.LETTERS.DETAIL(id)
    );
    return response.data.data;
  },

  create: async (payload: CreateLetterInput): Promise<Letter> => {
    const response = await apiClient.post<ApiResponse<Letter>>(
      API_ENDPOINTS.LETTERS.BASE,
      payload
    );
    return response.data.data;
  },

  update: async (id: string, payload: Partial<CreateLetterInput>): Promise<Letter> => {
    const response = await apiClient.put<ApiResponse<Letter>>(
      API_ENDPOINTS.LETTERS.DETAIL(id),
      payload
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.LETTERS.DETAIL(id));
  },

  getPDFUrl: (id: string) => API_ENDPOINTS.LETTERS.PDF(id),
};
