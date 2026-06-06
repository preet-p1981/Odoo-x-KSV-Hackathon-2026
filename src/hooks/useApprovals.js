import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export function useApprovals(params = {}) {
  return useQuery({
    queryKey: ['approvals', params],
    queryFn: async () => {
      const { data } = await api.get('/approvals', { params });
      return data?.data || data;
    },
  });
}

export function useApproval(id) {
  return useQuery({
    queryKey: ['approval', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/approvals/${id}`);
      return data?.data || data;
    },
  });
}

export function useApprovalAction(action) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remarks }) => api.patch(`/approvals/${id}/${action}`, remarks ? { remarks } : {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  });
}
