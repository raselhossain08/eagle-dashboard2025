import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('finance_admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const financeApi = {
    // Revenue
    getRevenue: (params: {
        period: string;
        startDate: string;
        endDate: string;
        subscriptionType?: string;
        currency?: string;
        includeRefunds?: boolean;
    }) => apiClient.get('/finance/revenue', { params }),

    // MRR
    getMRR: (params: {
        months: number;
        subscriptionType?: string;
        currency?: string;
    }) => apiClient.get('/finance/mrr', { params }),

    // Subscriptions
    getSubscriptions: (params: {
        period: string;
        startDate: string;
        endDate: string;
        subscriptionType?: string;
        includeTrials?: boolean;
        includeCanceled?: boolean;
    }) => apiClient.get('/finance/subscriptions', { params }),

    // Churn
    getChurn: (params: {
        period: string;
        startDate: string;
        endDate: string;
        subscriptionType?: string;
        includeVoluntary?: boolean;
        includeInvoluntary?: boolean;
    }) => apiClient.get('/finance/churn', { params }),

    // Dashboard
    getDashboard: (params: {
        period: string;
        currency?: string;
        compare?: boolean;
    }) => apiClient.get('/finance/dashboard', { params }),

    // KPIs
    getKPIs: (params: {
        period: string;
        months?: number;
    }) => apiClient.get('/finance/kpis', { params }),

    // Payments
    getPayments: (params: {
        startDate: string;
        endDate: string;
        status?: string;
        paymentMethod?: string;
        currency?: string;
        page?: number;
        limit?: number;
    }) => apiClient.get('/finance/payments', { params }),

    // Failed Payments
    getFailedPayments: (params: {
        startDate: string;
        endDate: string;
        groupBy?: string;
    }) => apiClient.get('/finance/failed-payments', { params }),

    // Refunds
    getRefunds: (params: {
        startDate: string;
        endDate: string;
        amount?: string;
        groupBy?: string;
    }) => apiClient.get('/finance/refunds', { params }),

    // Tax
    getTax: (params: {
        startDate: string;
        endDate: string;
        jurisdiction?: string;
        taxType?: string;
        format?: string;
    }) => apiClient.get('/finance/tax', { params }),

    // Forecasting
    getForecasting: (params: {
        months: number;
        model?: string;
        confidence?: number;
    }) => apiClient.get('/finance/forecasting', { params }),

    // LTV
    getLTV: (params: {
        subscriptionType?: string;
        period?: string;
        includeChurn?: boolean;
    }) => apiClient.get('/finance/ltv', { params }),

    // Cohort
    getCohort: (params: {
        startDate: string;
        endDate: string;
        metric?: string;
    }) => apiClient.get('/finance/cohort', { params }),
};