import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export function useQuotations(params = {}) {
  return useQuery({
    queryKey: ['quotations', params],
    queryFn: async () => {
      const { data } = await api.get('/quotations', { params });
      return data?.data || data;
    },
  });
}

export function useSaveQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => api.post('/quotations', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotations'] }),
  });
}
