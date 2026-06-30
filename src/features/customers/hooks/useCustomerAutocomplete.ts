import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { ApiResponse } from '../../../types/api';

export interface AutocompleteCustomer {
  name: string;
  phone: string | null;
}

export const useCustomerAutocomplete = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const { data, isLoading, isError } = useQuery<AutocompleteCustomer[]>({
    queryKey: ['customers', 'autocomplete', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await apiClient.get<ApiResponse<AutocompleteCustomer[]>>(
        API_ENDPOINTS.CUSTOMERS.AUTOCOMPLETE,
        {
          params: { query: debouncedQuery },
        }
      );
      return response.data.data;
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60000,
  });

  return {
    suggestions: data || [],
    isLoading,
    isError,
  };
};
