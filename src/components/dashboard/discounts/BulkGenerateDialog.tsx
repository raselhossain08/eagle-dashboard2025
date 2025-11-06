'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { discountService } from '@/lib/services/discount.service';

interface BulkGenerateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: () => void;
}

export function BulkGenerateDialog({ open, onOpenChange, onGenerate }: BulkGenerateDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        prefix: 'BULK',
        count: 10,
        type: 'percentage' as 'percentage' | 'fixed',
        value: 10,
        name: '',
        description: '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        perCustomer: 1,
        total: 100,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.prefix.trim()) {
            toast.error('Please enter a code prefix');
            return;
        }

        if (formData.count < 1 || formData.count > 1000) {
            toast.error('Count must be between 1 and 1000');
            return;
        }

        if (formData.value <= 0) {
            toast.error('Value must be greater than 0');
            return;
        }

        setLoading(true);
        try {
            const data = {
                prefix: formData.prefix,
                count: formData.count,
                type: formData.type,
                value: formData.value,
                name: formData.name || `Bulk ${formData.prefix} Discounts`,
                description: formData.description,
                validUntil: formData.validUntil,
                usageLimit: {
                    perCustomer: formData.perCustomer,
                    total: formData.total,
                },
                applicableTo: {
                    plans: [],
                    billingCycles: [],
                    userTypes: [],
                },
            };

            const response = await discountService.bulkGenerateDiscounts(data);
            toast.success(`Successfully generated ${response.data.generated} discount codes`);
            onGenerate();
            onOpenChange(false);

            // Reset form
            setFormData({
                prefix: 'BULK',
                count: 10,
                type: 'percentage',
                value: 10,
                name: '',
                description: '',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                perCustomer: 1,
                total: 100,
            });
        } catch (error) {
            console.error('Error generating bulk discounts:', error);
            toast.error('Failed to generate discount codes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Generate Discounts</DialogTitle>
                    <DialogDescription>Generate multiple discount codes at once with the same settings</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prefix">Code Prefix *</Label>
                            <Input
                                id="prefix"
                                value={formData.prefix}
                                onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }))}
                                placeholder="e.g., SUMMER2024"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Codes will be: PREFIX-XXXXX</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="count">Number of Codes *</Label>
                            <Input
                                id="count"
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.count}
                                onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Discount Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">
                                {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                step={formData.type === 'percentage' ? '1' : '0.01'}
                                max={formData.type === 'percentage' ? '100' : undefined}
                                value={formData.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Campaign Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Summer Sale 2024"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this discount campaign"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="validUntil">Valid Until *</Label>
                        <Input
                            id="validUntil"
                            type="date"
                            value={formData.validUntil}
                            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="perCustomer">Usage Per Customer *</Label>
                            <Input
                                id="perCustomer"
                                type="number"
                                min="1"
                                value={formData.perCustomer}
                                onChange={(e) => setFormData(prev => ({ ...prev, perCustomer: parseInt(e.target.value) || 1 }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total">Total Usage Limit</Label>
                            <Input
                                id="total"
                                type="number"
                                min="1"
                                value={formData.total}
                                onChange={(e) => setFormData(prev => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
                                placeholder="Leave 0 for unlimited"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Generating...' : `Generate ${formData.count} Codes`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
