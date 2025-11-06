// components/analytics/growth-dashboard.tsx
'use client';

import { useGrowth } from '@/lib/hooks/useReportAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function GrowthDashboard() {
    const { data, loading, error } = useGrowth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Growth Analytics</h2>
                <div className="text-sm text-muted-foreground">
                    Channel performance & user retention
                </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.growthMetrics.totalUsers.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                            +{data.growthMetrics.growthRate}% growth
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">New Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.growthMetrics.newUsers.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                            {data.growthMetrics.returningUsers.toLocaleString()} returning
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.growthMetrics.compoundMonthlyGrowth}%</div>
                        <div className="text-xs text-muted-foreground">
                            Projected: {data.growthMetrics.projectedMonthlyUsers.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Overall Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.cohortRetention.overallRetention.week1}%</div>
                        <div className="text-xs text-muted-foreground">Week 1 retention</div>
                    </CardContent>
                </Card>
            </div>

            {/* Channel Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Channel Performance</CardTitle>
                    <CardDescription>Marketing channel effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Channel</TableHead>
                                <TableHead>Sessions</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Conversions</TableHead>
                                <TableHead>CVR</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead>ROI</TableHead>
                                <TableHead>LTV</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(data.channelPerformance).map(([key, channel]: [string, any]) => (
                                <TableRow key={key}>
                                    <TableCell className="font-medium">{channel.name}</TableCell>
                                    <TableCell>{channel.sessions.toLocaleString()}</TableCell>
                                    <TableCell>{channel.users.toLocaleString()}</TableCell>
                                    <TableCell>{channel.conversions.toLocaleString()}</TableCell>
                                    <TableCell>{channel.conversionRate}%</TableCell>
                                    <TableCell>${channel.revenue.toLocaleString()}</TableCell>
                                    <TableCell>
                                        {channel.roi ? (
                                            <Badge variant={channel.roi > 5 ? "default" : "secondary"}>
                                                {channel.roi}x
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>${channel.avgLTV}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Cohort Retention */}
            <Card>
                <CardHeader>
                    <CardTitle>Cohort Retention</CardTitle>
                    <CardDescription>User retention over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cohort</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Week 0</TableHead>
                                <TableHead>Week 1</TableHead>
                                <TableHead>Week 2</TableHead>
                                <TableHead>Week 3</TableHead>
                                <TableHead>Week 4</TableHead>
                                <TableHead>Avg LTV</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.cohortRetention.cohorts.map((cohort: any) => (
                                <TableRow key={cohort.cohortDate}>
                                    <TableCell className="font-medium">
                                        {new Date(cohort.cohortDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{cohort.cohortSize}</TableCell>
                                    <TableCell>{cohort.week0}%</TableCell>
                                    <TableCell>{cohort.week1}%</TableCell>
                                    <TableCell>{cohort.week2}%</TableCell>
                                    <TableCell>{cohort.week3}%</TableCell>
                                    <TableCell>{cohort.week4 || '-'}%</TableCell>
                                    <TableCell>${cohort.avgLTV}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}