// hooks/useTaxCalculation.ts
import { useState } from 'react';
import { TaxCalculationRequest, TaxCalculationResponse } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';

export const useTaxCalculation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<TaxCalculationResponse['data'] | null>(null);

    const calculateTax = async (request: TaxCalculationRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.calculateTax(request);
            setResult(response.data);
            return response.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to calculate tax';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
    };

    return {
        calculateTax,
        result,
        loading,
        error,
        reset,
    };
};