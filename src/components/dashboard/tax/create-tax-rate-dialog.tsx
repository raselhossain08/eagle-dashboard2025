// components/tax/create-tax-rate-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { TaxRate } from '@/types/tax';

interface CreateTaxRateDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSave: (data: Partial<TaxRate>) => Promise<void>;
}

const TAX_TYPES = [
    'SALES_TAX',
    'VAT',
    'GST',
    'WITHHOLDING',
    'EXCISE',
    'OTHER'
] as const;

const PRODUCT_TYPES = [
    'DIGITAL_SERVICES',
    'SUBSCRIPTIONS',
    'PHYSICAL_GOODS',
    'SERVICES'
];

const CUSTOMER_TYPES = [
    'INDIVIDUAL',
    'BUSINESS',
    'NON_PROFIT'
];

export function CreateTaxRateDialog({ open, onOpenChange, onSave }: CreateTaxRateDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TaxRate>>({
        name: '',
        description: '',
        country: 'US',
        state: '',
        taxType: 'SALES_TAX',
        rate: 0,
        active: true,
        applicableToProducts: [],
        customerTypes: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onOpenChange?.(false);
            setFormData({
                name: '',
                description: '',
                country: 'US',
                state: '',
                taxType: 'SALES_TAX',
                rate: 0,
                active: true,
                applicableToProducts: [],
                customerTypes: []
            });
        } catch (error) {
            console.error('Failed to create tax rate:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleArrayItem = (array: string[], item: string) => {
        return array.includes(item)
            ? array.filter(i => i !== item)
            : [...array, item];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax Rate
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Tax Rate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxType">Tax Type *</Label>
                            <Select
                                value={formData.taxType}
                                onValueChange={(value: TaxRate['taxType']) => setFormData({ ...formData, taxType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TAX_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate">Rate (%) *</Label>
                            <Input
                                id="rate"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.rate}
                                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Applicable To</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Products</Label>
                                <div className="space-y-2 mt-2">
                                    {PRODUCT_TYPES.map(product => (
                                        <div key={product} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`product-${product}`}
                                                checked={formData.applicableToProducts?.includes(product) || false}
                                                onChange={() => setFormData({
                                                    ...formData,
                                                    applicableToProducts: toggleArrayItem(
                                                        formData.applicableToProducts || [],
                                                        product
                                                    )
                                                })}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`product-${product}`} className="text-sm">
                                                {product.replace('_', ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Customer Types</Label>
                                <div className="space-y-2 mt-2">
                                    {CUSTOMER_TYPES.map(customer => (
                                        <div key={customer} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`customer-${customer}`}
                                                checked={formData.customerTypes?.includes(customer) || false}
                                                onChange={() => setFormData({
                                                    ...formData,
                                                    customerTypes: toggleArrayItem(
                                                        formData.customerTypes || [],
                                                        customer
                                                    )
                                                })}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`customer-${customer}`} className="text-sm">
                                                {customer.replace('_', ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                        />
                        <Label>Active</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Tax Rate'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}