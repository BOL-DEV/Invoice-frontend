import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../../../services/invoice.service';
import { Invoice, InvoiceStatus, InvoiceRevenueSummary } from '../../../types/api';
import { InvoiceFormInput } from '../schemas';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  issuedBy?: string;
  startDate?: string;
  endDate?: string;
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
    onSuccess: () => {
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

export const useInvoiceRevenueSummary = (issuedBy?: string) => {
  return useQuery<InvoiceRevenueSummary>({
    queryKey: ['invoices', 'summary', issuedBy],
    queryFn: () => invoiceService.getSummary(issuedBy),
    refetchInterval: 30000,
  });
};

export const useShareInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, targetUserId, notes }: { invoiceId: string; targetUserId: string; notes?: string }) =>
      invoiceService.share(invoiceId, targetUserId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'details', variables.invoiceId] });
    },
  });
};

export const useRevokeShareInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, targetUserId }: { invoiceId: string; targetUserId: string }) =>
      invoiceService.revokeShare(invoiceId, targetUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'details', variables.invoiceId] });
    },
  });
};
