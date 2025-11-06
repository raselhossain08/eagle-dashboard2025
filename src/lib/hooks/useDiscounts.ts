// hooks/useDiscounts.ts
'use client';

import { useState, useCallback } from 'react';
import { discountService, Discount, DiscountsResponse, DiscountStats, DiscountAnalytics, SearchParams, BulkGenerateData } from '@/lib/services/discount.service';

export function useDiscounts() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);

    const fetchDiscounts = useCallback(async (params: SearchParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await discountService.getAllDiscounts(params);
            if (response.success) {
                setDiscounts(response.data.discounts);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch discounts');
        } finally {
            setLoading(false);
        }
    }, []);

    const createDiscount = useCallback(async (data: Partial<Discount>) => {
        try {
            const response = await discountService.createDiscount(data);
            if (response.success) {
                await fetchDiscounts(); // Refresh the list
                return response.data.discount;
            }
        } catch (err) {
            throw err;
        }
    }, [fetchDiscounts]);

    const updateDiscount = useCallback(async (id: string, data: Partial<Discount>) => {
        try {
            const response = await discountService.updateDiscount(id, data);
            if (response.success) {
                setDiscounts(prev => prev.map(discount =>
                    discount._id === id ? { ...discount, ...response.data.discount } : discount
                ));
                return response.data.discount;
            }
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteDiscount = useCallback(async (id: string) => {
        try {
            const response = await discountService.deleteDiscount(id);
            if (response.success) {
                setDiscounts(prev => prev.filter(discount => discount._id !== id));
            }
        } catch (err) {
            throw err;
        }
    }, []);

    const bulkGenerate = useCallback(async (data: BulkGenerateData) => {
        try {
            const response = await discountService.bulkGenerateDiscounts(data);
            if (response.success) {
                await fetchDiscounts(); // Refresh the list
                return response.data;
            }
        } catch (err) {
            throw err;
        }
    }, [fetchDiscounts]);

    return {
        discounts,
        loading,
        error,
        pagination,
        fetchDiscounts,
        createDiscount,
        updateDiscount,
        deleteDiscount,
        bulkGenerate,
    };
}

export function useDiscountStats() {
    const [stats, setStats] = useState<DiscountStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await discountService.getDiscountStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch discount statistics');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stats,
        loading,
        error,
        fetchStats,
    };
}

export function useDiscountAnalytics() {
    const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async (period: '7d' | '30d' | '90d' = '30d') => {
        setLoading(true);
        setError(null);

        try {
            const response = await discountService.getDiscountAnalytics(period);
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch discount analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        analytics,
        loading,
        error,
        fetchAnalytics,
    };
}