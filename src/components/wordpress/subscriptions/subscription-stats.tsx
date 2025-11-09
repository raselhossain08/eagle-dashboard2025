import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscriptionService } from '@/services/subscriptionService';

interface SubscriptionStatsProps {
    summary: {
        total_subscriptions: number;
        active_subscriptions: number;
        monthly_recurring_revenue: number;
        subscription_products: number;
    };
}

export function SubscriptionStats({ summary }: SubscriptionStatsProps) {
    const stats = [
        {
            title: 'Total Subscriptions',
            value: summary.total_subscriptions.toString(),
            description: 'All subscriptions',
        },
        {
            title: 'Active Subscriptions',
            value: summary.active_subscriptions.toString(),
            description: 'Currently active',
        },
        {
            title: 'Monthly Revenue',
            value: subscriptionService.formatCurrency(summary.monthly_recurring_revenue.toString()),
            description: 'Recurring revenue',
        },
        {
            title: 'Products',
            value: summary.subscription_products.toString(),
            description: 'Subscription products',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}