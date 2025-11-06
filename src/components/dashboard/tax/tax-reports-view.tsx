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
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
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
                                Period: {report.reportPeriod.startDate} to {report.reportPeriod.endDate}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${report.summary.totalTaxCollected.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Tax Collected</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {report.summary.totalTransactions.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Transactions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        ${report.summary.averageTaxPerTransaction.toFixed(2)}
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
                                {report.breakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                                        <div>
                                            <div className="font-medium">
                                                {item.state} ({item.country})
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.taxType} • {item.transactionCount} transactions
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">${item.totalTaxCollected.toLocaleString()}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Avg. rate: {item.averageRate}%
                                            </div>
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