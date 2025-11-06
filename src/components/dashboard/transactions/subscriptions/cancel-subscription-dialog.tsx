// components/subscriptions/cancel-subscription-dialog.tsx
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { paypalService } from '@/lib/services/paypal.service';
import { Subscription } from '@/types/paypal';
import { Loader2 } from 'lucide-react';

interface CancelSubscriptionDialogProps {
    subscription: Subscription | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubscriptionCancelled: () => void;
}

export function CancelSubscriptionDialog({
    subscription,
    open,
    onOpenChange,
    onSubscriptionCancelled,
}: CancelSubscriptionDialogProps) {
    const [cancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState('');

    const handleCancelSubscription = async () => {
        if (!subscription) return;

        try {
            setCancelling(true);
            await paypalService.cancelSubscription(subscription._id, reason);
            onSubscriptionCancelled();
            onOpenChange(false);
            setReason('');
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel the subscription for{' '}
                        <strong>{subscription?.contractNumber}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="reason">Cancellation Reason</Label>
                    <Textarea
                        id="reason"
                        placeholder="Please provide a reason for cancellation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReason('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={cancelling || !reason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancel Subscription
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}