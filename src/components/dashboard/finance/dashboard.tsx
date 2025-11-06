'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
    useRevenue,
    useMRR,
    useChurn,
    useDashboard,
    useKPIs
} from '@/hooks/useFinance';
import { RevenueMetrics } from './revenue-metrics';
import { MRRMetrics } from './mrr-metrics';
import { ChurnAnalysis } from './churn-analysis';
import { SubscriptionMetrics } from './subscription-metrics';
import { QuickStats } from './quick-stats';
import { KPIOverview } from './kpi-overview';
import {
    TrendingUp,
    Users,
    DollarSign,
    RefreshCw,
    Download,
    Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export function FinanceDashboard() {
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [activeTab, setActiveTab] = useState('overview');

    const dashboardParams = {
        period: 'month',
        currency: 'USD',
        compare: true,
    };

    const revenueParams = {
        period: 'monthly',
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        currency: 'USD',
        includeRefunds: true,
    };

    const { data: dashboardData, isLoading: dashboardLoading } = useDashboard(dashboardParams);
    const { data: revenueData, isLoading: revenueLoading } = useRevenue(revenueParams);
    const { data: mrrData, isLoading: mrrLoading } = useMRR({ months: 12, currency: 'USD' });
    const { data: churnData, isLoading: churnLoading } = useChurn(revenueParams);

    const isLoading = dashboardLoading || revenueLoading || mrrLoading || churnLoading;

    const handleExport = () => {
        // Export logic here
        console.log('Exporting data...');
    };

    const handleRefresh = () => {
        // Refresh all queries
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor your revenue, subscriptions, and business metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                    />
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            {dashboardData && <QuickStats data={dashboardData.quickStats} />}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="churn">Churn</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <KPIOverview
                        dashboardData={dashboardData}
                        revenueData={revenueData}
                        mrrData={mrrData}
                        isLoading={isLoading}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {revenueData && (
                            <RevenueMetrics data={revenueData} />
                        )}
                        {mrrData && (
                            <MRRMetrics data={mrrData} />
                        )}
                    </div>
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                    {revenueData && <RevenueMetrics data={revenueData} detailed />}
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="space-y-6">
                    <SubscriptionMetrics
                        startDate={revenueParams.startDate}
                        endDate={revenueParams.endDate}
                    />
                </TabsContent>

                {/* Churn Tab */}
                <TabsContent value="churn" className="space-y-6">
                    {churnData && <ChurnAnalysis data={churnData} />}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Forecast</CardTitle>
                                <CardDescription>Next 6 months prediction</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Forecasting chart component */}
                                <div className="h-80 flex items-center justify-center text-muted-foreground">
                                    Forecasting Chart
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cohort Analysis</CardTitle>
                                <CardDescription>Customer retention over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Cohort analysis component */}
                                <div className="h-80 flex items-center justify-center text-muted-foreground">
                                    Cohort Analysis Chart
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}