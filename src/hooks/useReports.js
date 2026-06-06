import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

const fetcher = async (path) => {
  const { data } = await api.get(path);
  return data?.data || data;
};

export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: () => fetcher('/reports/dashboard') });
export const useSpendingReport = () => useQuery({ queryKey: ['spending-report'], queryFn: () => fetcher('/reports/spending') });
export const useVendorPerformance = () => useQuery({ queryKey: ['vendor-performance'], queryFn: () => fetcher('/reports/vendor-performance') });
export const useProcurementTrend = () => useQuery({ queryKey: ['procurement-trend'], queryFn: () => fetcher('/reports/procurement-trend') });
