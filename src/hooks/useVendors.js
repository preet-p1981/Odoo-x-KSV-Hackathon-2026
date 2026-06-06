import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export function useVendors(params = {}) {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const { data } = await api.get('/vendors', { params });
      return data?.data || data;
    },
  });
}

export function useVendor(id) {
  return useQuery({
    queryKey: ['vendor', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/vendors/${id}`);
      return data?.data || data;
    },
  });
}

export function useSaveVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (id ? api.put(`/vendors/${id}`, payload) : api.post('/vendors', payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useVendorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => api.patch(`/vendors/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });
}
