// components/discounts/DiscountDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDiscounts, useDiscountStats, useDiscountAnalytics } from '@/hooks/useDiscounts';
import { DiscountsTable } from './DiscountsTable';
import { DiscountFilters } from './DiscountFilters';
import { StatsOverview } from './StatsOverview';
import { AnalyticsCharts } from './AnalyticsCharts';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Plus, Tags } from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { CreateDiscountDialog } from './CreateDiscountDialog';
import { BulkGenerateDialog } from './BulkGenerateDialog';

export function DiscountDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        type: '',
    });
    const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const [createDiscountOpen, setCreateDiscountOpen] = useState(false);
    const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    const { discounts, loading, error, pagination, fetchDiscounts } = useDiscounts();
    const { stats, fetchStats } = useDiscountStats();
    const { analytics, fetchAnalytics } = useDiscountAnalytics();

    useEffect(() => {
        fetchDiscounts();
        fetchStats();
        fetchAnalytics(analyticsPeriod);
    }, [fetchDiscounts, fetchStats, fetchAnalytics, analyticsPeriod]);

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
        fetchDiscounts({
            ...newFilters,
            page: 1,
            limit: 20,
        });
    };

    const handleRefresh = () => {
        fetchDiscounts();
        fetchStats();
        fetchAnalytics(analyticsPeriod);
    };

    const handleDiscountCreated = () => {
        setCreateDiscountOpen(false);
        fetchDiscounts();
        fetchStats();
        fetchAnalytics(analyticsPeriod);
    };

    const handleBulkGenerated = () => {
        setBulkGenerateOpen(false);
        fetchDiscounts();
        fetchStats();
        fetchAnalytics(analyticsPeriod);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Discount Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage discount codes, track performance and analytics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setBulkGenerateOpen(true)}>
                        <Tags className="h-4 w-4 mr-2" />
                        Bulk Generate
                    </Button>
                    <Button onClick={() => setCreateDiscountOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Discount
                    </Button>
                    <ExportDialog
                        open={exportOpen}
                        onOpenChange={setExportOpen}
                        onExport={(format: string) => console.log('Export as:', format)}
                    />
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="discounts">All Discounts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <StatsOverview stats={stats} loading={loading} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Discount Codes</CardTitle>
                            <CardDescription>
                                Recently created discount codes and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DiscountsTable
                                discounts={discounts.slice(0, 5)}
                                loading={loading}
                                showPagination={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="discounts" className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <SearchBar
                            onSearch={(search: string) => handleFilterChange({ ...filters, search })}
                            placeholder="Search discounts by code, name..."
                        />
                        <DiscountFilters filters={filters} onFilterChange={handleFilterChange} />
                    </div>

                    <DiscountsTable
                        discounts={discounts}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page: number) => fetchDiscounts({ ...filters, page })}
                        onDiscountsChange={fetchDiscounts}
                    />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Discount Analytics</h2>
                            <p className="text-muted-foreground">
                                Performance metrics and usage patterns
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {(['7d', '30d', '90d'] as const).map((period) => (
                                <Button
                                    key={period}
                                    variant={analyticsPeriod === period ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setAnalyticsPeriod(period);
                                        fetchAnalytics(period);
                                    }}
                                >
                                    {period}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <AnalyticsCharts analytics={analytics} loading={loading} />
                </TabsContent>
            </Tabs>

            <CreateDiscountDialog
                open={createDiscountOpen}
                onOpenChange={setCreateDiscountOpen}
                onDiscountCreated={handleDiscountCreated}
            />

            <BulkGenerateDialog
                open={bulkGenerateOpen}
                onOpenChange={setBulkGenerateOpen}
                onGenerate={(data: any) => {
                    console.log('Bulk generate:', data);
                    handleBulkGenerated();
                }}
            />
        </div>
    );
}