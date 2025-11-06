'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { billingService } from '@/lib/services/billing.service';
import { TaxRate } from '@/lib/types/billing';
import { CreateTaxRateDialog } from '@/components/dashboard/billing/create-tax-rate-dialog';
import { EditTaxRateDialog } from '@/components/dashboard/billing/edit-tax-rate-dialog';
import { DeleteTaxRateDialog } from '@/components/dashboard/tax/delete-tax-rate-dialog';
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';

export default function TaxRatesPage() {
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Filters
    const [country, setCountry] = useState('');
    const [taxType, setTaxType] = useState('all');
    const [active, setActive] = useState<string>('all');

    useEffect(() => {
        loadTaxRates();
    }, [country, taxType, active]);

    const loadTaxRates = async () => {
        try {
            setLoading(true);
            const response = await billingService.getTaxRates({
                page: 1,
                limit: 20,
                country: country || undefined,
                taxType: taxType === 'all' ? undefined : taxType,
                active: active === 'true' ? true : active === 'false' ? false : undefined,
            });
            setTaxRates(response.data || []);
        } catch (error) {
            console.error('Failed to load tax rates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (taxRate: TaxRate) => {
        setSelectedTaxRate(taxRate);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (taxRate: TaxRate) => {
        setSelectedTaxRate(taxRate);
        setIsDeleteDialogOpen(true);
    };

    const getTaxTypeVariant = (taxType: string) => {
        switch (taxType) {
            case 'SALES_TAX':
                return 'default';
            case 'VAT':
                return 'secondary';
            case 'GST':
                return 'outline';
            default:
                return 'default';
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tax Rates</h2>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tax Rate
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Country code (US, GB, etc.)"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        />
                        <Select value={taxType} onValueChange={setTaxType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tax Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                                <SelectItem value="VAT">VAT</SelectItem>
                                <SelectItem value="GST">GST</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={active} onValueChange={setActive}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadTaxRates}>
                            <Filter className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tax Rates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Tax Rates</CardTitle>
                    <CardDescription>
                        Manage tax rates for different jurisdictions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Jurisdiction</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Effective Period</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxRates.map((taxRate) => (
                                <TableRow key={taxRate._id}>
                                    <TableCell className="font-medium">
                                        {taxRate.name}
                                    </TableCell>
                                    <TableCell>
                                        {taxRate.country}
                                        {taxRate.state && `-${taxRate.state}`}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getTaxTypeVariant(taxRate.taxType)}>
                                            {taxRate.taxType.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {taxRate.rate}%
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={taxRate.active ? 'default' : 'secondary'}>
                                            {taxRate.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {taxRate.effectiveFrom && (
                                            <div className="text-sm">
                                                {new Date(taxRate.effectiveFrom).toLocaleDateString()}
                                                {taxRate.effectiveTo && ` - ${new Date(taxRate.effectiveTo).toLocaleDateString()}`}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(taxRate)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(taxRate)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <CreateTaxRateDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onTaxRateCreated={loadTaxRates}
            />

            <EditTaxRateDialog
                taxRate={selectedTaxRate}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onTaxRateUpdated={loadTaxRates}
            />

            <DeleteTaxRateDialog
                rate={selectedTaxRate}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDelete={async (id: string) => {
                    await billingService.deleteTaxRate(id);
                    await loadTaxRates();
                }}
            />
        </div>
    );
}