'use client';

import { useState, useEffect } from 'react';
import { TaxRatesTable } from './tax-rates-table';
import { TaxRate } from '@/lib/types/tax';
import { taxService } from '@/lib/services/tax.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaxRateDialog } from './create-tax-rate-dialog';
import { toast } from 'sonner';

export function TaxRatesManager() {
    const [rates, setRates] = useState<TaxRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const loadRates = async () => {
        setLoading(true);
        try {
            const response = await taxService.getTaxRates({});
            setRates(response.data);
        } catch (error) {
            console.error('Failed to load tax rates:', error);
            toast.error('Failed to load tax rates');
        } finally {
            setLoading(false);
        }
    };

    // Load rates on component mount
    useEffect(() => {
        loadRates();
    }, []);

    const handleEdit = async (id: string, data: Partial<TaxRate>) => {
        try {
            await taxService.updateTaxRate(id, data);
            toast.success('Tax rate updated successfully');
            await loadRates();
        } catch (error) {
            console.error('Failed to update tax rate:', error);
            toast.error('Failed to update tax rate');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await taxService.deleteTaxRate(id);
            toast.success('Tax rate deleted successfully');
            await loadRates();
        } catch (error) {
            console.error('Failed to delete tax rate:', error);
            toast.error('Failed to delete tax rate');
        }
    };

    const handleCreate = async (data: Partial<TaxRate>) => {
        try {
            await taxService.createTaxRate(data);
            toast.success('Tax rate created successfully');
            await loadRates();
            setCreateDialogOpen(false);
        } catch (error) {
            console.error('Failed to create tax rate:', error);
            toast.error('Failed to create tax rate');
            throw error; // Re-throw to let dialog handle it
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Tax Rates</CardTitle>
                        <CardDescription>Manage tax rates for different jurisdictions</CardDescription>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tax Rate
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <TaxRatesTable
                    taxRates={rates}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </CardContent>
            <CreateTaxRateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSave={handleCreate}
            />
        </Card>
    );
}