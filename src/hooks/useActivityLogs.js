import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export function useActivityLogs(params = {}) {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/activity-logs', { params });
      return data?.data || data;
    },
  });
}

export function useMyActivityLogs() {
  return useQuery({
    queryKey: ['my-activity-logs'],
    queryFn: async () => {
      const { data } = await api.get('/activity-logs/mine');
      return data?.data || data;
    },
  });
}
