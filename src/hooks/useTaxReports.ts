// hooks/useTaxReports.ts
import { useState, useEffect } from 'react';
import { TaxReport } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';

interface UseTaxReportsProps {
    startDate: string;
    endDate: string;
    groupBy?: string;
    country?: string;
    state?: string;
}

export const useTaxReports = (params: UseTaxReportsProps) => {
    const [report, setReport] = useState<TaxReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.getTaxReports(params);
            setReport(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tax report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.startDate && params.endDate) {
            fetchReport();
        }
    }, [JSON.stringify(params)]);

    return {
        report,
        loading,
        error,
        refetch: fetchReport,
    };
};