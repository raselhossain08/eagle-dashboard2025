// hooks/useTaxValidation.ts
import { useState } from 'react';
import { TaxValidationRequest, TaxValidationResponse } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';

export const useTaxValidation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<TaxValidationResponse['data'] | null>(null);

    const validateTaxId = async (request: TaxValidationRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.validateTaxId(request);
            setResult(response.data);
            return response.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to validate tax ID';
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
        validateTaxId,
        result,
        loading,
        error,
        reset,
    };
};