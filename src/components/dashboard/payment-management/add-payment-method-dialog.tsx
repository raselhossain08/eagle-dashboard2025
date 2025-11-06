// components/add-payment-method-dialog.tsx
'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { toast } from 'sonner';

interface AddPaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddPaymentMethodDialog({ open, onOpenChange }: AddPaymentMethodDialogProps) {
    const { createMethod } = usePaymentMethods();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        type: 'card' | 'bank_account';
        last4: string;
        brand: string;
        expiryMonth: string;
        expiryYear: string;
        cardToken: string;
        customer: string;
    }>({
        type: 'card',
        last4: '',
        brand: 'visa',
        expiryMonth: '',
        expiryYear: '',
        cardToken: 'tok_visa',
        customer: 'customer_id',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createMethod(formData);
            toast.success('Payment method added successfully');
            onOpenChange(false);
            // Reset form
            setFormData({
                type: 'card',
                last4: '',
                brand: 'visa',
                expiryMonth: '',
                expiryYear: '',
                cardToken: 'tok_visa',
                customer: 'customer_id',
            });
        } catch (error) {
            toast.error('Failed to add payment method');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                        Add a new payment method for customers
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'card' | 'bank_account' }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="card">Credit Card</SelectItem>
                                <SelectItem value="bank_account">Bank Account</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last4">Last 4 Digits</Label>
                        <Input
                            id="last4"
                            value={formData.last4}
                            onChange={(e) => setFormData(prev => ({ ...prev, last4: e.target.value }))}
                            placeholder="4242"
                            maxLength={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Select
                            value={formData.brand}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="visa">Visa</SelectItem>
                                <SelectItem value="mastercard">Mastercard</SelectItem>
                                <SelectItem value="amex">American Express</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiryMonth">Expiry Month</Label>
                            <Input
                                id="expiryMonth"
                                value={formData.expiryMonth}
                                onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                                placeholder="12"
                                maxLength={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryYear">Expiry Year</Label>
                            <Input
                                id="expiryYear"
                                value={formData.expiryYear}
                                onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                                placeholder="2025"
                                maxLength={4}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Payment Method'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}