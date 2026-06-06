import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export function useRFQs(params = {}) {
  return useQuery({
    queryKey: ['rfqs', params],
    queryFn: async () => {
      const { data } = await api.get('/rfqs', { params });
      return data?.data || data;
    },
  });
}

export function useRFQ(id) {
  return useQuery({
    queryKey: ['rfq', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/rfqs/${id}`);
      return data?.data || data;
    },
  });
}

export function useRFQCompare(id) {
  return useQuery({
    queryKey: ['rfq-compare', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/rfqs/${id}/quotations/compare`);
      return data?.data || data;
    },
  });
}

export function useSaveRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (id ? api.put(`/rfqs/${id}`, payload) : api.post('/rfqs', payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rfqs'] }),
  });
}

export function useRFQAction(action) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.patch(`/rfqs/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rfqs'] }),
  });
}
