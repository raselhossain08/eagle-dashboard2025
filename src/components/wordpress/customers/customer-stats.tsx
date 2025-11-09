import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import { customerService } from '@/services/customerService';

interface CustomerStatsProps {
    summary: {
        total_customers: number;
        active_customers: number;
        new_customers_this_month: number;
    };
}

export function CustomerStats({ summary }: CustomerStatsProps) {
    const stats = [
        {
            title: 'Total Customers',
            value: customerService.formatNumber(summary.total_customers),
            description: 'All registered customers',
            icon: Users,
            color: 'text-blue-600',
        },
        {
            title: 'Active Customers',
            value: customerService.formatNumber(summary.active_customers),
            description: 'Customers with orders',
            icon: UserCheck,
            color: 'text-green-600',
        },
        {
            title: 'New This Month',
            value: customerService.formatNumber(summary.new_customers_this_month),
            description: 'Recent registrations',
            icon: UserPlus,
            color: 'text-purple-600',
        },
        {
            title: 'Active Rate',
            value: `${((summary.active_customers / summary.total_customers) * 100).toFixed(1)}%`,
            description: 'Percentage of active customers',
            icon: TrendingUp,
            color: 'text-orange-600',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
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