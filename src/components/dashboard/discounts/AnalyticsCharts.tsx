// components/discounts/AnalyticsCharts.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscountAnalytics } from '@/lib/services/discount.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsChartsProps {
    analytics: DiscountAnalytics | null;
    loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsCharts({ analytics, loading }: AnalyticsChartsProps) {
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No analytics data available</p>
            </div>
        );
    }

    // Safely handle potentially undefined arrays
    const usageData = (analytics.usageOverTime || []).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        redemptions: item.redemptions || 0,
        revenueImpact: item.revenueImpact || 0,
        conversionRate: item.conversionRate || 0,
    }));

    const topDiscountsData = (analytics.topPerforming || []).slice(0, 5).map((discount: any) => ({
        name: discount.code,
        value: discount.usageLimit?.used || 0,
        revenue: (discount.usageLimit?.used || 0) * (discount.value || 0) * (discount.type === 'percentage' ? 0.01 : 1),
    }));

    return (
        <div className="grid gap-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.summary?.totalDiscounts || 0}</div>
                        <p className="text-xs text-muted-foreground">Active and inactive codes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(analytics.summary?.totalRevenueImpact || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total discount amount</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(analytics.summary?.averageConversionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Average usage rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Usage Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Over Time</CardTitle>
                        <CardDescription>Redemptions and revenue impact trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={usageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="redemptions"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    name="Redemptions"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenueImpact"
                                    stroke="#00C49F"
                                    strokeWidth={2}
                                    name="Revenue Impact"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Performing Discounts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Discounts</CardTitle>
                        <CardDescription>Most used discount codes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topDiscountsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" name="Usage Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Conversion Rate Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Rate Trend</CardTitle>
                        <CardDescription>Daily conversion rate changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={usageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                                <Line
                                    type="monotone"
                                    dataKey="conversionRate"
                                    stroke="#FF8042"
                                    strokeWidth={2}
                                    name="Conversion Rate"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Discount Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance by Type</CardTitle>
                        <CardDescription>Revenue impact by discount type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={topDiscountsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="revenue"
                                >
                                    {topDiscountsData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value}`, 'Revenue Impact']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Discounts List */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Discounts</CardTitle>
                    <CardDescription>Detailed view of most successful discount codes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {(analytics.topPerforming || []).slice(0, 10).map((discount: any, index: number) => (
                            <div key={discount._id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{discount.code}</div>
                                        <div className="text-sm text-muted-foreground">{discount.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{discount.usageLimit?.used || 0} uses</div>
                                    <div className="text-sm text-muted-foreground">
                                        {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
