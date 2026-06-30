import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from '../../../services/approval.service';
import { ApprovalRequest, ApprovalStatus } from '../../../types/api';

interface ListParams {
  status?: ApprovalStatus;
}

export const useApprovalsList = (params: ListParams) => {
  return useQuery<ApprovalRequest[]>({
    queryKey: ['approvals', 'list', params],
    queryFn: () => approvalService.list(params),
  });
};

export const useCreateApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { invoiceId: string; type: 'EDIT' | 'PRINT' | 'DELETE'; reason: string }) =>
      approvalService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'list'] });
    },
  });
};

export const useActionApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: 'APPROVED' | 'REJECTED'; adminNotes?: string | null } }) =>
      approvalService.action(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'details', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};
