import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import type { RevenueData, MRRData, ChurnData, DashboardData } from '@/types/finance';

export const useRevenue = (params: any) => {
    return useQuery({
        queryKey: ['revenue', params],
        queryFn: () => financeApi.getRevenue(params).then(res => res.data.data as RevenueData),
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useMRR = (params: any) => {
    return useQuery({
        queryKey: ['mrr', params],
        queryFn: () => financeApi.getMRR(params).then(res => res.data.data as MRRData),
    });
};

export const useChurn = (params: any) => {
    return useQuery({
        queryKey: ['churn', params],
        queryFn: () => financeApi.getChurn(params).then(res => res.data.data as ChurnData),
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useDashboard = (params: any) => {
    return useQuery({
        queryKey: ['dashboard', params],
        queryFn: () => financeApi.getDashboard(params).then(res => res.data.data as DashboardData),
    });
};

export const useKPIs = (params: any) => {
    return useQuery({
        queryKey: ['kpis', params],
        queryFn: () => financeApi.getKPIs(params).then(res => res.data.data),
    });
};