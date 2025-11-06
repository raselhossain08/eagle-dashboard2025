// components/analytics/real-time-dashboard.tsx
'use client';

import { useRealTime } from '@/lib/hooks/useReportAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';

export function RealTimeDashboard() {
    const { data, loading, error } = useRealTime();

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

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'desktop': return <Monitor className="w-4 h-4" />;
            case 'mobile': return <Smartphone className="w-4 h-4" />;
            case 'tablet': return <Tablet className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Real-time Analytics</h2>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
            </div>

            {/* Active Users */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Active Users Right Now
                    </CardTitle>
                    <CardDescription>
                        {data.timeWindow}-minute window • {data.activeUsers.change > 0 ? '+' : ''}{data.activeUsers.change}% change
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between">
                        <div className="text-4xl font-bold">{data.activeUsers.count}</div>
                        <div className={`flex items-center ${data.activeUsers.changeDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className={`w-5 h-5 mr-1 ${data.activeUsers.changeDirection === 'down' ? 'rotate-180' : ''}`} />
                            {Math.abs(data.activeUsers.change)}%
                        </div>
                    </div>

                    {/* Trend Chart (simplified) */}
                    <div className="mt-4 flex items-end justify-between h-12">
                        {data.activeUsers.trend.map((point: any, index: number) => (
                            <div
                                key={index}
                                className="flex-1 mx-1 bg-primary/20 rounded-t flex flex-col items-center"
                                style={{ height: `${(point.count / Math.max(...data.activeUsers.trend.map((p: any) => p.count))) * 100}%` }}
                            >
                                <span className="text-xs -mt-6">{point.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Page</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.topPages.map((page: any) => (
                                    <TableRow key={page.path}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell>{page.activeUsers}</TableCell>
                                        <TableCell>{page.avgTimeOnPage}s</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Traffic Sources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Traffic Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.trafficSources.map((source: any) => (
                                <div key={source.source} className="flex justify-between items-center">
                                    <span className="capitalize font-medium">{source.source}</span>
                                    <div className="text-right">
                                        <div>{source.activeUsers || source.count} users</div>
                                        <div className="text-sm text-muted-foreground">{source.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Events */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.recentEvents.map((event: any) => (
                                <div key={event.eventId} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {getDeviceIcon(event.device)}
                                        <div>
                                            <div className="font-medium">{event.name}</div>
                                            <div className="text-sm text-muted-foreground">{event.page}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{event.time}</div>
                                        <Badge variant="secondary" className="text-xs">
                                            {event.country}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Device & Country Breakdown */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Device Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(data.deviceBreakdown).map(([device, count]: [string, any]) => (
                                    <div key={device} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getDeviceIcon(device)}
                                            <span className="capitalize">{device}</span>
                                        </div>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Top Countries
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.topCountries.map((country: any) => (
                                    <div key={country.code} className="flex justify-between items-center">
                                        <span>{country.name}</span>
                                        <span className="font-medium">{country.activeUsers}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}