// hooks/useTransactions.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { transactionService, Transaction, TransactionsResponse, TransactionStats, SearchParams } from '../services/transactio.service';


export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);

    const fetchTransactions = useCallback(async (params: SearchParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await transactionService.getUserTransactions(params);
            if (response.success) {
                setTransactions(response.transactions);
                setPagination(response.pagination);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchTransactions = useCallback(async (query: string, params: SearchParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await transactionService.searchTransactions(query, params);
            if (response.success) {
                setTransactions(response.transactions);
                setPagination(response.pagination);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search transactions';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        transactions,
        loading,
        error,
        pagination,
        fetchTransactions,
        searchTransactions,
    };
}

export function useTransactionStats() {
    const [stats, setStats] = useState<TransactionStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (filters: { startDate?: string; endDate?: string; type?: string } = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await transactionService.getTransactionStats(filters);
            if (response.success) {
                setStats(response.stats);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
            setError(errorMessage);
            toast.error(errorMessage);
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