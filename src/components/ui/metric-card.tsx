// components/ui/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down';
    format?: 'number' | 'percentage' | 'duration';
}

export function MetricCard({ title, value, change, trend, format = 'number' }: MetricCardProps) {
    const formatValue = (val: string | number) => {
        // Handle NaN, null, undefined, or invalid values
        const numVal = Number(val);
        if (isNaN(numVal)) return '0';

        if (format === 'percentage') return `${numVal}%`;
        if (format === 'duration') {
            const minutes = Math.round(numVal / 60);
            const seconds = Math.round(numVal % 60);
            return `${minutes}m ${seconds}s`;
        }
        return new Intl.NumberFormat().format(numVal);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatValue(value)}</div>
                {change !== undefined && !isNaN(change) && trend && (
                    <div className={cn(
                        "flex items-center text-xs",
                        trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </CardContent>
        </Card>
    );
}