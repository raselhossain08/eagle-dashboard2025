// components/payment-dashboard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethodsTable } from '@/components/dashboard/payment-management/payment-methods-table';
import { FailedPaymentsTable } from '@/components/dashboard/payment-management/failed-payments-table';
import { PaymentSummary } from '@/components/dashboard/payment-management/payment-summary';
import { PaymentProcessors } from '@/components/dashboard/payment-management/payment-processors';
import { AddPaymentMethodDialog } from '@/components/dashboard/payment-management/add-payment-method-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';


export function PaymentDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddDialog, setShowAddDialog] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
                    <p className="text-muted-foreground">
                        Manage payment methods, failed payments, and processor configurations
                    </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                </Button>
            </div>

            <PaymentSummary />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="methods">Payment Methods</TabsTrigger>
                    <TabsTrigger value="failed">Failed Payments</TabsTrigger>
                    <TabsTrigger value="processors">Processors</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <PaymentMethodsTable limit={5} />
                        <FailedPaymentsTable limit={5} />
                    </div>
                </TabsContent>

                <TabsContent value="methods">
                    <PaymentMethodsTable />
                </TabsContent>

                <TabsContent value="failed">
                    <FailedPaymentsTable />
                </TabsContent>

                <TabsContent value="processors">
                    <PaymentProcessors />
                </TabsContent>
            </Tabs>

            <AddPaymentMethodDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
            />
        </div>
    );
}