// hooks/useTaxCompliance.ts
import { useState, useEffect } from 'react';
import { TaxCompliance } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';

interface UseTaxComplianceProps {
    country?: string;
    state?: string;
    status?: string;
}

export const useTaxCompliance = (params?: UseTaxComplianceProps) => {
    const [compliance, setCompliance] = useState<TaxCompliance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCompliance = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.getComplianceStatus(params);
            setCompliance(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch compliance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompliance();
    }, [JSON.stringify(params)]);

    const updateCompliance = async (country: string, state: string, data: Partial<TaxCompliance>) => {
        try {
            const response = await taxService.updateComplianceStatus(country, state, data);
            await fetchCompliance(); // Refresh the list
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    return {
        compliance,
        loading,
        error,
        refetch: fetchCompliance,
        updateCompliance,
    };
};