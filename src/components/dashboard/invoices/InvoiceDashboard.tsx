'use client';

import { useState } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceFilters } from './InvoiceFilters';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceStats } from './InvoiceStats';
import { CreateInvoiceDialog } from './CreateInvoiceDialog';
import { ExportDialog } from './ExportDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Plus, RefreshCw } from 'lucide-react';

export function InvoiceDashboard() {
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        start_date: '',
        end_date: '',
        status: '',
        subscriber_id: '',
    });

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);

    const { data, isLoading, error, refetch } = useInvoices(filters);

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-red-600">
                        Error loading invoices: {(error as Error).message}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">
                        Manage and track all customer invoices
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowExportDialog(true)}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Invoice
                    </Button>
                </div>
            </div>

            <InvoiceStats data={data?.data} />

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Management</CardTitle>
                    <CardDescription>
                        View, manage, and create customer invoices
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InvoiceFilters onFilterChange={handleFilterChange} />
                    <InvoiceTable
                        invoices={data?.data || []}
                        pagination={data?.pagination}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                    />
                </CardContent>
            </Card>

            <CreateInvoiceDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <ExportDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
            />
        </div>
    );
}