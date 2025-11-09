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
    const [showExportDialog, setShowExportDialog] = useState(false);

    const { transactions, loading, error, pagination, fetchTransactions, searchTransactions } = useTransactions();
    const { stats, loading: statsLoading, fetchStats } = useTransactionStats();

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
                    <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
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
                    <StatsOverview stats={stats} loading={statsLoading} />

                    {/* Earnings Breakdown Card */}
                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                Total Earnings Breakdown
                            </CardTitle>
                            <CardDescription>
                                Detailed view of your all-time earnings and fees
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gross Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            }).format(stats?.totalAmount || 0)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">From {stats?.succeededCount || 0} successful payments</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-sm text-muted-foreground">Transaction Fees</p>
                                        <p className="text-xl font-semibold text-red-600">
                                            - {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            }).format(stats?.totalFees || 0)}
                                        </p>
                                    </div>

                                    <div className="p-4 border rounded-lg md:col-span-2 bg-primary/5">
                                        <p className="text-sm text-muted-foreground">Net Earnings (After Fees)</p>
                                        <p className="text-5xl font-bold text-primary">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            }).format(stats?.totalNet || 0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This is your actual earnings
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                    <div className="text-center p-3 bg-muted/50 rounded">
                                        <p className="text-xs text-muted-foreground">Refunded</p>
                                        <p className="text-sm font-semibold">{stats?.refundedCount || 0}</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded">
                                        <p className="text-xs text-muted-foreground">Disputed</p>
                                        <p className="text-sm font-semibold">{stats?.disputedCount || 0}</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded">
                                        <p className="text-xs text-muted-foreground">Failed</p>
                                        <p className="text-sm font-semibold">{stats?.failedCount || 0}</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded">
                                        <p className="text-xs text-muted-foreground">Success Rate</p>
                                        <p className="text-sm font-semibold">{stats?.successRate || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                        onRefresh={handleRefresh}
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

            <ExportDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
                filters={filters}
            />
        </div>
    );
}