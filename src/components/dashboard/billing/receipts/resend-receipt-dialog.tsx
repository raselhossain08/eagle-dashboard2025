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
import { billingService } from '@/lib/services/billing.service';
import { Receipt } from '@/lib/types/billing';
import { Loader2, Mail } from 'lucide-react';

interface ResendReceiptDialogProps {
    receipt: Receipt | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReceiptResent: () => void;
}

export function ResendReceiptDialog({
    receipt,
    open,
    onOpenChange,
    onReceiptResent,
}: ResendReceiptDialogProps) {
    const [resending, setResending] = useState(false);

    const handleResend = async () => {
        if (!receipt) return;

        try {
            setResending(true);
            await billingService.resendReceiptEmail(receipt._id);
            onReceiptResent();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to resend receipt:', error);
        } finally {
            setResending(false);
        }
    };

    if (!receipt) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Resend Receipt
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to resend the receipt for {receipt.receiptNumber} to{' '}
                        <strong>
                            {typeof receipt.customerId === 'string'
                                ? receipt.customerEmail
                                : receipt.customerId.email}
                        </strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Resend Receipt
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}