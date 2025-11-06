'use client';

import { useState } from 'react';
import { TaxRatesTable } from './tax-rates-table';
import { TaxRate } from '@/lib/types/tax';
import { taxService } from '@/lib/services/tax.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaxRateDialog } from './create-tax-rate-dialog';

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
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id: string, data: Partial<TaxRate>) => {
        await taxService.updateTaxRate(id, data);
        await loadRates();
    };

    const handleDelete = async (id: string) => {
        await taxService.deleteTaxRate(id);
        await loadRates();
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
                onSave={async (data) => {
                    await taxService.createTaxRate(data);
                    await loadRates();
                    setCreateDialogOpen(false);
                }}
            />
        </Card>
    );
}
