// components/transactions/StatsOverview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionStats } from '@/lib/transaction/transactionService';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';

interface StatsOverviewProps {
    stats: TransactionStats | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const statCards = [
        {
            title: 'Total Revenue',
            value: stats?.totalAmount || 0,
            format: 'currency',
            icon: DollarSign,
            description: 'Gross amount processed',
        },
        {
            title: 'Successful Transactions',
            value: stats?.succeededCount || 0,
            format: 'number',
            icon: CreditCard,
            description: 'Completed payments',
        },
        {
            title: 'Success Rate',
            value: stats?.successRate || 0,
            format: 'percentage',
            icon: TrendingUp,
            description: 'Payment success ratio',
        },
        {
            title: 'Failed Transactions',
            value: stats?.failedCount || 0,
            format: 'number',
            icon: AlertCircle,
            description: 'Failed payments',
        },
    ];

    const formatValue = (value: number, format: string) => {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(value);
            case 'percentage':
                return `${value}%`;
            default:
                return value.toLocaleString();
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatValue(card.value, card.format)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}