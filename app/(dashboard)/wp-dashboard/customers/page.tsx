'use client';

import { useState, useEffect } from 'react';
import { CustomerStats } from '@/components/customers/customer-stats';
import { CustomerFilters } from '@/components/customers/customer-filters';
import { CustomerTable } from '@/components/customers/customer-table';
import { CustomerPagination } from '@/components/customers/customer-pagination';
import { customerService } from '@/services/customerService';
import { CustomersResponse } from '@/types/customer';

export default function CustomersPage() {
    const [data, setData] = useState<CustomersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = async (page: number = 1, query: string = '') => {
        try {
            setLoading(true);
            setError(null);

            let response: CustomersResponse;
            if (query) {
                response = await customerService.searchCustomers(query, page);
            } else {
                response = await customerService.getCustomers(page);
            }

            setData(response);
            setCurrentPage(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        fetchCustomers(1, query);
    };

    const handlePageChange = (page: number) => {
        fetchCustomers(page, searchQuery);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    if (loading && !data) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading customers...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-lg text-red-600 mb-4">Error: {error}</div>
                        <button
                            onClick={() => fetchCustomers()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">No customer data available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground">
                    Manage and view all customer information and orders
                </p>
            </div>

            {/* Stats Cards */}
            <CustomerStats summary={data.data.summary} />

            {/* Filters and Search */}
            <CustomerFilters
                onSearch={handleSearch}
                searchQuery={searchQuery}
                resultCount={data.data.pagination.total}
            />

            {/* Customers Table */}
            <CustomerTable
                customers={data.data.customers}
                loading={loading}
            />

            {/* Pagination */}
            <CustomerPagination
                pagination={data.data.pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
}