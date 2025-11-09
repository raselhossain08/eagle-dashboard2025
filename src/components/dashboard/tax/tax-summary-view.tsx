// components/tax/tax-summary-view.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TaxSummary } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';
import { TrendingUp, TrendingDown, DollarSign, MapPin, FileText, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function TaxSummaryView() {
    const [summary, setSummary] = useState<TaxSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await taxService.getTaxSummary();
            setSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch tax summary:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load tax summary';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-3 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !summary) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive mb-4">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{error || 'Failed to load tax summary'}</p>
                    </div>
                    <Button onClick={fetchSummary} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tax Rates</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.overview?.totalTaxRates || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {summary.overview?.activeTaxRates || 0} active, {summary.overview?.inactiveTaxRates || 0} inactive
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.overview?.countries || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        Across {summary.overview?.states || 0} states/regions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${(summary.recentActivity?.last30Days?.taxCollected || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {summary.recentActivity?.last30Days?.transactionCount || 0} transactions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${(summary.recentActivity?.last7Days?.taxCollected || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {summary.recentActivity?.last30Days?.taxCollected ?
                            `+${((summary.recentActivity.last7Days.taxCollected / summary.recentActivity.last30Days.taxCollected) * 100).toFixed(1)}% from monthly average`
                            : 'No data available'
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}