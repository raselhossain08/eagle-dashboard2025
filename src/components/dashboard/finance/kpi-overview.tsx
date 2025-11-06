'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';

interface KPIOverviewProps {
    dashboardData?: any;
    revenueData?: any;
    mrrData?: any;
    isLoading: boolean;
}

export function KPIOverview({ dashboardData, revenueData, mrrData, isLoading }: KPIOverviewProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-[120px]" />
                            <Skeleton className="h-3 w-40 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const kpis = [
        {
            title: 'Total Revenue',
            value: `$${dashboardData?.totalRevenue?.toLocaleString() || '0'}`,
            change: '+12.5%',
            icon: DollarSign,
            trend: 'up',
        },
        {
            title: 'Monthly Recurring Revenue',
            value: `$${mrrData?.current?.toLocaleString() || '0'}`,
            change: '+8.2%',
            icon: TrendingUp,
            trend: 'up',
        },
        {
            title: 'Active Subscribers',
            value: dashboardData?.activeSubscribers?.toLocaleString() || '0',
            change: '+5.3%',
            icon: Users,
            trend: 'up',
        },
        {
            title: 'Customer Lifetime Value',
            value: `$${dashboardData?.ltv?.toLocaleString() || '0'}`,
            change: '+2.1%',
            icon: Activity,
            trend: 'up',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className={kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                    {kpi.change}
                                </span>{' '}
                                from last period
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
