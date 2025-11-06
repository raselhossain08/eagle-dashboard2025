// components/analytics/integrations-dashboard.tsx
'use client';

import { useIntegrations } from '@/lib/hooks/useReportAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';

export function IntegrationsDashboard() {
    const { data, loading, error } = useIntegrations();

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
            case 'disabled':
                return <Badge variant="secondary">Disabled</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getConnectionIcon = (connected: boolean) => {
        return connected ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
            <XCircle className="w-5 h-5 text-red-600" />
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Analytics Integrations</h2>
                <div className="text-sm text-muted-foreground">
                    {data.summary.activeIntegrations} of {data.summary.totalIntegrations} active
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalIntegrations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.activeIntegrations}</div>
                        <div className="text-xs text-muted-foreground">
                            {data.summary.healthStatus === 'healthy' ? 'All systems normal' : 'Issues detected'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{data.summary.healthStatus}</div>
                        <div className="text-xs text-muted-foreground">
                            {data.summary.lastError ? 'Last error detected' : 'No recent errors'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Integrations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Connected Services</CardTitle>
                    <CardDescription>Manage your analytics integrations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Connection</TableHead>
                                <TableHead>Last Sync</TableHead>
                                <TableHead>Events Today</TableHead>
                                <TableHead>Errors</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.integrations.map((integration: any, index: number) => (
                                <TableRow key={integration.provider || `integration-${index}`}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
                                                <span className="text-sm font-medium">
                                                    {integration.name?.split(' ').map((word: string) => word[0]).join('') || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{integration.name || 'Unknown'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {integration.propertyId || integration.projectId || 'Not configured'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={integration.enabled}
                                                onCheckedChange={() => {/* Handle toggle */ }}
                                            />
                                            {getStatusBadge(integration.status)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {getConnectionIcon(integration.connected)}
                                            <span>{integration.connected ? 'Connected' : 'Disconnected'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {integration.lastSync ? (
                                            new Date(integration.lastSync).toLocaleDateString()
                                        ) : (
                                            <span className="text-muted-foreground">Never</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {integration.eventsToday !== undefined ? (
                                            integration.eventsToday.toLocaleString()
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {integration.errorCount !== undefined ? (
                                            integration.errorCount > 0 ? (
                                                <Badge variant="destructive">{integration.errorCount}</Badge>
                                            ) : (
                                                <span className="text-green-600">0</span>
                                            )
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}