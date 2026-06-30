import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../../../services/invoice.service';
import { Invoice, InvoiceStatus } from '../../../types/api';
import { InvoiceFormInput } from '../schemas';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
}

export const useInvoicesList = (params: ListParams) => {
  return useQuery({
    queryKey: ['invoices', 'list', params],
    queryFn: () => invoiceService.list(params),
  });
};

export const useInvoiceDetails = (id: string | null) => {
  return useQuery<Invoice | null>({
    queryKey: ['invoices', 'details', id],
    queryFn: () => (id ? invoiceService.getById(id) : null),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceFormInput) => invoiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useUpdateInvoice = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceFormInput) => invoiceService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};
