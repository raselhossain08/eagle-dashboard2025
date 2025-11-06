// components/tax/tax-summary-view.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaxSummary } from '@/types/tax';
import { taxService } from '@/lib/services/tax.service';
import { TrendingUp, TrendingDown, DollarSign, MapPin, FileText, Users } from 'lucide-react';

export function TaxSummaryView() {
    const [summary, setSummary] = useState<TaxSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await taxService.getTaxSummary();
                setSummary(response.data);
            } catch (error) {
                console.error('Failed to fetch tax summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!summary) {
        return <div>Error loading summary</div>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tax Rates</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.overview.totalTaxRates}</div>
                    <p className="text-xs text-muted-foreground">
                        {summary.overview.activeTaxRates} active, {summary.overview.inactiveTaxRates} inactive
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.overview.countries}</div>
                    <p className="text-xs text-muted-foreground">
                        Across {summary.overview.states} states/regions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${summary.recentActivity.last30Days.taxCollected.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        {summary.recentActivity.last30Days.transactionCount} transactions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${summary.recentActivity.last7Days.taxCollected.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        +{((summary.recentActivity.last7Days.taxCollected / summary.recentActivity.last30Days.taxCollected) * 100).toFixed(1)}% from monthly average
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}