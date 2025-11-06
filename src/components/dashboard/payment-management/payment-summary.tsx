// components/payment-summary.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentSummary as PaymentSummaryType } from '@/lib/services/payment.service';
import { paymentService } from '@/lib/services/payment.service';
import { TrendingUp, TrendingDown, CreditCard, AlertCircle } from 'lucide-react';

export function PaymentSummary() {
    const [summary, setSummary] = useState<PaymentSummaryType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await paymentService.getPaymentSummary();
                setSummary(response.data);
            } catch (error) {
                console.error('Failed to fetch payment summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return <div>Loading summary...</div>;
    }

    if (!summary) {
        return <div>Failed to load summary</div>;
    }

    const cards = [
        {
            title: 'Total Methods',
            value: summary.totalMethods.toString(),
            description: 'Payment methods',
            icon: CreditCard,
            trend: 'neutral' as const,
        },
        {
            title: 'Active Methods',
            value: summary.activeMethods.toString(),
            description: 'Currently active',
            icon: TrendingUp,
            trend: 'positive' as const,
        },
        {
            title: 'Failed Payments',
            value: summary.failedPayments.toString(),
            description: 'Recent failures',
            icon: AlertCircle,
            trend: 'negative' as const,
        },
        {
            title: 'Recovery Rate',
            value: `${summary.recoveryRate}%`,
            description: 'Successful retries',
            icon: TrendingUp,
            trend: Number.parseFloat(summary.recoveryRate) > 50 ? 'positive' : 'negative',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}