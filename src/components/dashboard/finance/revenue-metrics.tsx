import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { RevenueData } from '@/types/finance';

interface RevenueMetricsProps {
    data: RevenueData;
    detailed?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RevenueMetrics({ data, detailed = false }: RevenueMetricsProps) {
    const { summary, bySubscriptionType, trend, growth } = data;

    const subscriptionData = Object.entries(bySubscriptionType).map(([name, stats]) => ({
        name,
        value: stats.revenue,
        percentage: stats.percentage,
    }));

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">${summary.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className={`p-2 rounded-full ${growth.growth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {growth.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <Badge variant={growth.growth >= 0 ? 'default' : 'destructive'}>
                                {growth.growth >= 0 ? '+' : ''}{growth.growth}%
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-2">
                                vs previous period
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                            <p className="text-2xl font-bold">${summary.netRevenue.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            After ${summary.refunds.toLocaleString()} in refunds
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                            <p className="text-2xl font-bold">{summary.transactionCount.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Avg: ${summary.averageTransactionValue}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Growth Amount</p>
                            <p className="text-2xl font-bold">+${growth.growthAmount.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            From previous period
                        </p>
                    </CardContent>
                </Card>
            </div>

            {detailed && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Daily revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).getDate().toString()}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                                        labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0088FE"
                                        strokeWidth={2}
                                        dot={{ fill: '#0088FE' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Revenue by Subscription Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Subscription Type</CardTitle>
                            <CardDescription>Distribution across plans</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={subscriptionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {subscriptionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {subscriptionData.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm">{item.name}</span>
                                        </div>
                                        <div className="text-sm font-medium">
                                            ${item.value.toLocaleString()} ({item.percentage}%)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}