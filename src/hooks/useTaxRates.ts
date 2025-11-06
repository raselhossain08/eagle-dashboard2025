// hooks/useTaxRates.ts
import { useState, useEffect } from 'react';
import { TaxRate, Pagination } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';

interface UseTaxRatesProps {
    page?: number;
    limit?: number;
    filters?: {
        country?: string;
        state?: string;
        taxType?: string;
        active?: boolean;
    };
}

export const useTaxRates = ({ page = 1, limit = 10, filters = {} }: UseTaxRatesProps) => {
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTaxRates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.getTaxRates({
                page,
                limit,
                ...filters,
            });
            setTaxRates(response.data);
            setPagination(response.pagination || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tax rates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxRates();
    }, [page, limit, JSON.stringify(filters)]);

    const createTaxRate = async (data: Partial<TaxRate>) => {
        try {
            const response = await taxService.createTaxRate(data);
            await fetchTaxRates(); // Refresh the list
            return response;
        } catch (err) {
            throw err;
        }
    };

    const updateTaxRate = async (id: string, data: Partial<TaxRate>) => {
        try {
            const response = await taxService.updateTaxRate(id, data);
            await fetchTaxRates(); // Refresh the list
            return response;
        } catch (err) {
            throw err;
        }
    };

    const deleteTaxRate = async (id: string) => {
        try {
            const response = await taxService.deleteTaxRate(id);
            await fetchTaxRates(); // Refresh the list
            return response;
        } catch (err) {
            throw err;
        }
    };

    return {
        taxRates,
        pagination,
        loading,
        error,
        refetch: fetchTaxRates,
        createTaxRate,
        updateTaxRate,
        deleteTaxRate,
    };
};