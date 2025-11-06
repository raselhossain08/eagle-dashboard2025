import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const financeApi = {
    getRevenue: (params: any) => {
        return axios.get(`${API_URL}/finance/revenue`, { params });
    },

    getMRR: (params: any) => {
        return axios.get(`${API_URL}/finance/mrr`, { params });
    },

    getChurn: (params: any) => {
        return axios.get(`${API_URL}/finance/churn`, { params });
    },

    getDashboard: (params: any) => {
        return axios.get(`${API_URL}/finance/dashboard`, { params });
    },

    getKPIs: (params: any) => {
        return axios.get(`${API_URL}/finance/kpis`, { params });
    },

    exportData: (params: any) => {
        return axios.get(`${API_URL}/finance/export`, {
            params,
            responseType: 'blob'
        });
    },
};
