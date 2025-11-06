// components/analytics/export-dashboard.tsx
'use client';

import { useState } from 'react';
import { analyticsService } from '@/lib/services/report-analytics.service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, FileText, Database } from 'lucide-react';

export function ExportDashboard() {
    const [exportData, setExportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await analyticsService.exportData();
            setExportData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (exportData?.downloadUrl) {
            window.open(exportData.downloadUrl, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Data Export</h2>
                <Button onClick={handleExport} disabled={loading}>
                    {loading ? (
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                    ) : (
                        <Database className="w-4 h-4 mr-2" />
                    )}
                    Generate Export
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {exportData ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Export Ready
                        </CardTitle>
                        <CardDescription>
                            Your analytics data has been prepared for download
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium">Period</div>
                                        <div className="text-sm text-muted-foreground">
                                            {exportData.period?.startDate || 'N/A'} to {exportData.period?.endDate || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium">Records</div>
                                        <div className="text-sm text-muted-foreground">
                                            {exportData.recordCount?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Database className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium">File Size</div>
                                        <div className="text-sm text-muted-foreground">
                                            {exportData.fileSize || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Badge variant={exportData.format === 'json' ? 'default' : 'secondary'}>
                                        {(exportData.format || 'json').toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <div className="font-medium">Export ID: {exportData.exportId || 'N/A'}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Generated: {exportData.generatedAt ? new Date(exportData.generatedAt).toLocaleString() : 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Expires: {exportData.expiresAt ? new Date(exportData.expiresAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                                <Button onClick={handleDownload}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Export Analytics Data</CardTitle>
                        <CardDescription>
                            Generate a comprehensive export of your analytics data in JSON format.
                            The export will include sessions, events, and summary data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Data Included</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                                            <li>Session data</li>
                                            <li>Event analytics</li>
                                            <li>User metrics</li>
                                            <li>Funnel data</li>
                                            <li>Growth metrics</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Format</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                                            <li>JSON format</li>
                                            <li>Structured data</li>
                                            <li>Ready for analysis</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Availability</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                                            <li>24-hour download window</li>
                                            <li>Secure download link</li>
                                            <li>No size limits</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}