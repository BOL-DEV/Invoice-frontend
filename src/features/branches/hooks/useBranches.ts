import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService, CreateBranchPayload, UpdateBranchPayload } from '../../../services/branch.service';
import { Branch } from '../../../types/api';

export const useBranches = () => {
  return useQuery<Branch[]>({
    queryKey: ['branches', 'list'],
    queryFn: () => branchService.list(),
  });
};

export const useBranch = (id?: string) => {
  return useQuery<Branch>({
    queryKey: ['branches', 'detail', id],
    queryFn: () => branchService.getById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => branchService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCreateBranchWithHead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: import('../../../services/branch.service').CreateBranchWithHeadPayload) =>
      branchService.createWithHead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBranchPayload }) =>
      branchService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
