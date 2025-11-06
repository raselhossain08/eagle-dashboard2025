// app/dashboard/tax/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaxSummaryView } from '@/components/dashboard/tax/tax-summary-view';
import { TaxRatesManager } from '@/components/dashboard/tax/tax-rates-manager';
import { TaxReportsView } from '@/components/dashboard/tax/tax-reports-view';
import { TaxCalculator } from '@/components/dashboard/tax/tax-calculator';
import { TaxValidation } from '@/components/dashboard/tax/tax-validation';
import { ComplianceStatus } from '@/components/dashboard/tax/compliance-status';

export default function TaxDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
                    <p className="text-muted-foreground">
                        Complete tax management system with calculation, validation, and compliance
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full max-w-2xl">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rates">Tax Rates</TabsTrigger>
                    <TabsTrigger value="calculator">Calculator</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <TaxSummaryView />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ComplianceStatus />
                        <TaxCalculator />
                    </div>
                </TabsContent>

                <TabsContent value="rates">
                    <TaxRatesManager />
                </TabsContent>

                <TabsContent value="calculator">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TaxCalculator />
                        <TaxValidation />
                    </div>
                </TabsContent>

                <TabsContent value="validation">
                    <TaxValidation />
                </TabsContent>

                <TabsContent value="reports">
                    <TaxReportsView />
                </TabsContent>
            </Tabs>
        </div>
    );
}