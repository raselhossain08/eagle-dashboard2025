// components/transactions/RefundDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Transaction, transactionService } from '@/lib/services/transactio.service';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RefundDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefundSuccess?: () => void;
}

export function RefundDialog({ transaction, open, onOpenChange, onRefundSuccess }: RefundDialogProps) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!transaction) return null;

    const maxAmount = transaction.amount.gross - (transaction.amount.refunded || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const refundAmount = parseFloat(amount);

        if (refundAmount > maxAmount) {
            setError(`Refund amount cannot exceed ${maxAmount.toFixed(2)}`);
            return;
        }

        if (refundAmount <= 0) {
            setError('Refund amount must be greater than 0');
            return;
        }

        if (!reason.trim()) {
            setError('Please provide a reason for the refund');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmRefund = async () => {
        setLoading(true);
        setShowConfirmation(false);

        try {
            const refundAmount = parseFloat(amount);

            await transactionService.requestRefund(transaction._id, {
                amount: refundAmount,
                reason: reason.trim(),
            });

            toast.success('Refund request submitted successfully');
            handleOpenChange(false);
            onRefundSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process refund';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !loading) {
            setAmount('');
            setReason('');
            setError(null);
            setShowConfirmation(false);
        }
        onOpenChange(newOpen);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Refund</DialogTitle>
                        <DialogDescription>
                            Request a refund for transaction {transaction.transactionId}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Refund Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={maxAmount}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter refund amount"
                                required
                                disabled={loading}
                            />
                            <p className="text-sm text-muted-foreground">
                                Maximum refundable: ${maxAmount.toFixed(2)} {transaction.currency}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Refund *</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter the reason for this refund"
                                required
                                disabled={loading}
                                rows={3}
                            />
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
                                Request Refund
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Refund Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to request a refund of ${parseFloat(amount || '0').toFixed(2)} {transaction.currency}?
                            <br />
                            <br />
                            <strong>Reason:</strong> {reason}
                            <br />
                            <br />
                            This action cannot be undone once processed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRefund}>
                            Confirm Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}