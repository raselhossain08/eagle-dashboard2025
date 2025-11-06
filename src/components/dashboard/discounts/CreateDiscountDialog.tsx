// components/discounts/CreateDiscountDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDiscounts } from '@/hooks/useDiscounts';
import { Discount } from '@/lib/services/discount.service';
import { AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateDiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDiscountCreated: () => void;
}

export function CreateDiscountDialog({ open, onOpenChange, onDiscountCreated }: CreateDiscountDialogProps) {
    const [formData, setFormData] = useState<Partial<Discount>>({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: 10,
        applicableTo: {
            plans: [],
            billingCycles: [],
            userTypes: [],
        },
        usageLimit: {
            total: 100,
            perCustomer: 1,
            used: 0,
        },
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { createDiscount } = useDiscounts();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createDiscount(formData);
            onDiscountCreated();
            onOpenChange(false);
            // Reset form
            setFormData({
                code: '',
                name: '',
                description: '',
                type: 'percentage',
                value: 10,
                applicableTo: {
                    plans: [],
                    billingCycles: [],
                    userTypes: [],
                },
                usageLimit: {
                    total: 100,
                    perCustomer: 1,
                    used: 0,
                },
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'active',
                isActive: true,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create discount');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setError(null);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Discount</DialogTitle>
                    <DialogDescription>
                        Create a new discount code with custom rules and limitations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Discount Code *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER2024"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Discount Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Summer Sale 2024"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description for this discount code"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Discount Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}
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
                                Discount Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                step={formData.type === 'percentage' ? '1' : '0.01'}
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalUsage">Total Usage Limit</Label>
                            <Input
                                id="totalUsage"
                                type="number"
                                min="0"
                                value={formData.usageLimit?.total || 0}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    usageLimit: { ...formData.usageLimit!, total: parseInt(e.target.value) || 0 }
                                })}
                                placeholder="0 for unlimited"
                            />
                            <p className="text-xs text-muted-foreground">0 means unlimited usage</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="perCustomer">Usage Per Customer *</Label>
                            <Input
                                id="perCustomer"
                                type="number"
                                min="1"
                                value={formData.usageLimit?.perCustomer || 1}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    usageLimit: { ...formData.usageLimit!, perCustomer: parseInt(e.target.value) }
                                })}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Discount
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}