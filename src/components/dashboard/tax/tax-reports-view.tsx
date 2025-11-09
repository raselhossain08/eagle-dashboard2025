// components/tax/tax-reports-view.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaxReports } from '@/hooks/useTaxReports';
import { Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { taxService } from '@/lib/services/tax.service';

export function TaxReportsView() {
    const [reportParams, setReportParams] = useState({
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        groupBy: 'state',
        country: '',
        state: '',
    });

    const { report, loading, error } = useTaxReports(reportParams);

    const handleGenerateReport = () => {
        // The report will automatically update when params change due to the hook
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            toast.loading('Exporting report...');
            const blob = await taxService.exportTaxReport(format, reportParams);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tax-report-${reportParams.startDate}-${reportParams.endDate}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.dismiss();
            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to export report');
            console.error('Export error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Tax Report</CardTitle>
                    <CardDescription>
                        Configure report parameters and generate detailed tax reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={reportParams.startDate}
                                onChange={(e) => setReportParams({ ...reportParams, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={reportParams.endDate}
                                onChange={(e) => setReportParams({ ...reportParams, endDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="groupBy">Group By</Label>
                            <Select
                                value={reportParams.groupBy}
                                onValueChange={(value) => setReportParams({ ...reportParams, groupBy: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="state">State</SelectItem>
                                    <SelectItem value="country">Country</SelectItem>
                                    <SelectItem value="taxType">Tax Type</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={reportParams.country}
                                onChange={(e) => setReportParams({ ...reportParams, country: e.target.value })}
                                placeholder="e.g., US"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleGenerateReport} disabled={loading}>
                            <Calendar className="h-4 w-4 mr-2" />
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                        <Select onValueChange={(value) => handleExport(value as 'csv' | 'json')}>
                            <SelectTrigger className="w-[140px]">
                                <Download className="h-4 w-4 mr-2" />
                                <span>Export</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">Export CSV</SelectItem>
                                <SelectItem value="json">Export JSON</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-red-200">
                    <CardContent className="pt-6">
                        <div className="text-red-600">{error}</div>
                    </CardContent>
                </Card>
            )}

            {report && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Summary</CardTitle>
                            <CardDescription>
                                Period: {report.reportPeriod?.startDate || reportParams.startDate} to {report.reportPeriod?.endDate || reportParams.endDate}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${report.summary?.totalTaxCollected?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Tax Collected</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {report.summary?.totalTransactions?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Transactions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        ${report.summary?.averageTaxPerTransaction?.toFixed(2) || '0.00'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Avg. Tax per Transaction</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Breakdown by {reportParams.groupBy}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {report.breakdown && report.breakdown.length > 0 ? (
                                    report.breakdown.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <div className="font-medium">
                                                    {item.state || 'N/A'} ({item.country || 'N/A'})
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.taxType || 'N/A'} • {item.transactionCount || 0} transactions
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">${(item.totalTaxCollected || 0).toLocaleString()}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Avg. rate: {item.averageRate || 0}%
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        No breakdown data available for this period
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}