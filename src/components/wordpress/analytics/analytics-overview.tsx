import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, ShoppingCart, MessageSquare } from 'lucide-react';
import { AnalyticsData } from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';

interface AnalyticsOverviewProps {
    data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
    const overviewCards = [
        {
            title: 'Total Users',
            value: analyticsService.formatNumber(data.user_analytics.total_users),
            description: `${data.user_analytics.recent_registrations} recent registrations`,
            icon: Users,
            color: 'text-blue-600',
        },
        {
            title: 'Total Content',
            value: analyticsService.formatNumber(
                parseInt(data.content_analytics.total_posts) + parseInt(data.content_analytics.total_pages)
            ),
            description: `${data.content_analytics.total_posts} posts, ${data.content_analytics.total_pages} pages`,
            icon: FileText,
            color: 'text-green-600',
        },
        {
            title: 'WooCommerce',
            value: analyticsService.formatNumber(data.woocommerce_analytics.total_products),
            description: `${data.woocommerce_analytics.orders_in_period} orders in period`,
            icon: ShoppingCart,
            color: 'text-purple-600',
        },
        {
            title: 'Comments',
            value: analyticsService.formatNumber(data.content_analytics.total_comments),
            description: 'Total comments on site',
            icon: MessageSquare,
            color: 'text-orange-600',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewCards.map((card, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
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