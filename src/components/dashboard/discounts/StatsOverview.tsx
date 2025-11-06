// components/discounts/StatsOverview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscountStats } from '@/lib/services/discount.service';
import { Tag, ShoppingCart, TrendingDown, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsOverviewProps {
    stats: DiscountStats | null;
    loading: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
    // Safely extract values, handling various data structures
    const getStatValue = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value) || 0;
        if (value && typeof value === 'object' && 'value' in value) return getStatValue(value.value);
        return 0;
    };

    const activeCodes = getStatValue(stats?.activeCodes);
    const totalRedemptions = getStatValue(stats?.totalRedemptions);
    const revenueImpact = getStatValue(stats?.revenueImpact);
    const conversionRate = getStatValue(stats?.conversionRate);

    const statCards = [
        {
            title: 'Active Codes',
            value: String(activeCodes),
            change: getStatValue(stats?.percentageChanges?.activeCodes),
            icon: Tag,
            description: 'Currently active discount codes',
        },
        {
            title: 'Total Redemptions',
            value: String(totalRedemptions),
            change: getStatValue(stats?.percentageChanges?.redemptions),
            icon: ShoppingCart,
            description: 'Total times discounts were used',
        },
        {
            title: 'Revenue Impact',
            value: `$${revenueImpact.toLocaleString()}`,
            change: getStatValue(stats?.percentageChanges?.revenueImpact),
            icon: TrendingDown,
            description: 'Total discount amount given',
        },
        {
            title: 'Conversion Rate',
            value: `${conversionRate.toFixed(1)}%`,
            change: getStatValue(stats?.percentageChanges?.conversionRate),
            icon: BarChart3,
            description: 'Discount usage success rate',
        },
    ];

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            {card.change !== 0 && (
                                <>
                                    {card.change > 0 ? (
                                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                                    )}
                                    <span className={card.change > 0 ? 'text-green-500' : 'text-red-500'}>
                                        {Math.abs(card.change)}%
                                    </span>
                                    <span className="ml-1">from previous period</span>
                                </>
                            )}
                            {card.change === 0 && (
                                <span>No change from previous period</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}