import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface QuickStatsProps {
    data: {
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        failedPayments: number;
        pendingRefunds: number;
    };
}

export function QuickStats({ data }: QuickStatsProps) {
    const stats = [
        {
            title: "Today's Revenue",
            value: `$${data.todayRevenue.toLocaleString()}`,
            icon: DollarSign,
            description: "Revenue generated today",
            trend: "up" as const,
        },
        {
            title: "This Week",
            value: `$${data.weekRevenue.toLocaleString()}`,
            icon: TrendingUp,
            description: "Weekly revenue",
            trend: "up" as const,
        },
        {
            title: "This Month",
            value: `$${data.monthRevenue.toLocaleString()}`,
            icon: DollarSign,
            description: "Monthly revenue",
            trend: "up" as const,
        },
        {
            title: "Failed Payments",
            value: data.failedPayments.toString(),
            icon: AlertCircle,
            description: "Requires attention",
            trend: "down" as const,
        },
        {
            title: "Pending Refunds",
            value: data.pendingRefunds.toString(),
            icon: RefreshCw,
            description: "Awaiting processing",
            trend: "neutral" as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </div>
                            <div className={`p-2 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' :
                                    stat.trend === 'down' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}