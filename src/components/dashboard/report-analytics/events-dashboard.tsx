// components/analytics/events-dashboard.tsx
'use client';

import { useEvents } from '@/lib/hooks/useReportAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function EventsDashboard() {
    const { data, loading, error } = useEvents();

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
                <h2 className="text-3xl font-bold tracking-tight">Event Explorer</h2>
                <div className="text-sm text-muted-foreground">
                    {data.summary.totalEvents.toLocaleString()} total events
                </div>
            </div>

            {/* Event Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalEvents.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.uniqueUsers.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Events Per User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.eventsPerUser}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{data.summary.topEventCategories[0].category}</div>
                        <div className="text-xs text-muted-foreground">
                            {data.summary.topEventCategories[0].percentage}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.summary.topEventCategories.map((category: any) => (
                            <div key={category.category} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="capitalize">
                                        {category.category}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{category.count.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">{category.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Detailed event analysis with properties</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {data.events.map((event: any) => (
                            <div key={event.eventName} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-medium text-lg capitalize">{event.eventName.replace(/_/g, ' ')}</h4>
                                        <Badge variant="secondary" className="capitalize">
                                            {event.eventCategory}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{event.count.toLocaleString()} events</div>
                                        <div className="text-sm text-muted-foreground">
                                            {event.uniqueUsers.toLocaleString()} users
                                        </div>
                                    </div>
                                </div>

                                {/* Event Properties */}
                                {Object.keys(event.properties).length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-medium mb-2">Properties:</h5>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {Object.entries(event.properties).map(([property, values]: [string, any]) => (
                                                <div key={property}>
                                                    <h6 className="text-sm font-medium capitalize mb-1">
                                                        {property.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </h6>
                                                    <div className="space-y-1">
                                                        {Object.entries(values as Record<string, any>).slice(0, 3).map(([value, count]: [string, any]) => (
                                                            <div key={value} className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">{value}</span>
                                                                <span className="font-medium">{count}</span>
                                                            </div>
                                                        ))}
                                                        {Object.keys(values as Record<string, any>).length > 3 && (
                                                            <div className="text-xs text-muted-foreground">
                                                                +{Object.keys(values as Record<string, any>).length - 3} more...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top Pages */}
                                {event.topPages.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-medium mb-2">Top Pages:</h5>
                                        <div className="space-y-1">
                                            {event.topPages.map((page: any) => (
                                                <div key={page.path} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{page.path}</span>
                                                    <span className="font-medium">{page.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Segmentation */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Device Segmentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(data.segmentation.byDevice).map(([device, data]: [string, any]) => (
                                <div key={device} className="flex justify-between items-center">
                                    <span className="capitalize font-medium">{device}</span>
                                    <div className="text-right">
                                        <div>{data.count.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">{data.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Country Segmentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(data.segmentation.byCountry).map(([country, data]: [string, any]) => (
                                <div key={country} className="flex justify-between items-center">
                                    <span className="font-medium">{country}</span>
                                    <div className="text-right">
                                        <div>{data.count.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">{data.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}