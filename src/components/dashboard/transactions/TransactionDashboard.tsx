// components/transactions/TransactionDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions, useTransactionStats } from '@/hooks/useTransactions';
import { TransactionTable } from './TransactionTable';
import { StatsOverview } from './StatsOverview';
import { TransactionFilters } from './TransactionFilters';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { ExportDialog } from './ExportDialog';

export function TransactionDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        startDate: '',
        endDate: '',
    });
    const [searchQuery, setSearchQuery] = useState('');

    const { transactions, loading, error, pagination, fetchTransactions, searchTransactions } = useTransactions();
    const { stats, fetchStats } = useTransactionStats();

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, [fetchTransactions, fetchStats]);

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
        fetchTransactions({
            ...newFilters,
            page: 1,
            limit: 20,
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            searchTransactions(query);
        } else {
            fetchTransactions();
        }
    };

    const handleRefresh = () => {
        fetchTransactions();
        fetchStats();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor all payment transactions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportDialog transactions={transactions} />
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">All Transactions</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <StatsOverview stats={stats} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                Latest transaction activity across your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionTable
                                transactions={transactions.slice(0, 5)}
                                loading={loading}
                                showPagination={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <SearchBar onSearch={handleSearch} />
                        <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />
                    </div>

                    <TransactionTable
                        transactions={transactions}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page: number) => fetchTransactions({ ...filters, page })}
                    />
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Analytics</CardTitle>
                            <CardDescription>
                                Detailed analytics and insights about your transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">Analytics charts coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}