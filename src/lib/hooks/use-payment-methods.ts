// hooks/use-payment-methods.ts
import { useState, useCallback } from 'react';
import { PaymentMethod } from '@/lib/services/payment.service';
import { paymentService } from '@/lib/services/payment.service';

export const usePaymentMethods = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMethods = useCallback(async (page: number = 1, limit: number = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentService.getPaymentMethods(page, limit);
            setMethods(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
        } finally {
            setLoading(false);
        }
    }, []);

    const createMethod = useCallback(async (data: Partial<PaymentMethod>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentService.createPaymentMethod(data);
            setMethods(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create payment method');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMethod = useCallback(async (id: string, data: { status?: string; isDefault?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentService.updatePaymentMethod(id, data);
            setMethods(prev => prev.map(method =>
                method._id === id ? { ...method, ...response.data } : method
            ));
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update payment method');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteMethod = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await paymentService.deletePaymentMethod(id);
            setMethods(prev => prev.filter(method => method._id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete payment method');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        methods,
        loading,
        error,
        fetchMethods,
        createMethod,
        updateMethod,
        deleteMethod,
    };
};