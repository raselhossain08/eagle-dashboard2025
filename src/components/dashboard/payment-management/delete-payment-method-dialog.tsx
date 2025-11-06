// components/delete-payment-method-dialog.tsx
'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PaymentMethod } from '@/lib/services/payment.service';
import { toast } from 'sonner';

interface DeletePaymentMethodDialogProps {
    method: PaymentMethod | null;
    onClose: () => void;
    onDelete: (id: string) => Promise<void>;
}

export function DeletePaymentMethodDialog({ method, onClose, onDelete }: DeletePaymentMethodDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!method) return;

        setLoading(true);
        try {
            await onDelete(method._id);
            toast.success('Payment method deleted successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to delete payment method');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={!!method} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the payment method
                        {method && ` ending in ${method.last4}`} and remove it from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}