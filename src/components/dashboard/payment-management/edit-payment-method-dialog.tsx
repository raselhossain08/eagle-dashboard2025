// components/edit-payment-method-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PaymentMethod } from '@/lib/services/payment.service';
import { toast } from 'sonner';

interface EditPaymentMethodDialogProps {
    method: PaymentMethod | null;
    onClose: () => void;
    onUpdate: (id: string, data: any) => Promise<void>;
}

export function EditPaymentMethodDialog({ method, onClose, onUpdate }: EditPaymentMethodDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        status: 'active' | 'inactive';
        isDefault: boolean;
    }>({
        status: method?.status || 'active',
        isDefault: method?.isDefault || false,
    });

    useEffect(() => {
        if (method) {
            setFormData({
                status: method.status,
                isDefault: method.isDefault || false,
            });
        }
    }, [method]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!method) return;

        setLoading(true);
        try {
            await onUpdate(method._id, formData);
            toast.success('Payment method updated successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to update payment method');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={!!method} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Payment Method</DialogTitle>
                    <DialogDescription>
                        Update payment method status and preferences
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isDefault">Default Payment Method</Label>
                        <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Payment Method'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}