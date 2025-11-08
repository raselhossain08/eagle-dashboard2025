// components/transactions/RefundDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Transaction, transactionService } from '@/lib/services/transactio.service';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RefundDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ transaction, open, onOpenChange }: RefundDialogProps) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!transaction) return null;

    const maxAmount = transaction.amount.gross - (transaction.amount.refunded || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const refundAmount = parseFloat(amount);

            if (refundAmount > maxAmount) {
                setError(`Refund amount cannot exceed ${maxAmount}`);
                return;
            }

            await transactionService.requestRefund(transaction._id, {
                amount: refundAmount,
                reason,
            });

            onOpenChange(false);
            // You might want to refresh the transactions list here
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process refund');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setAmount('');
            setReason('');
            setError(null);
        }
        onOpenChange(newOpen);
    };

    return (
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
                        <Label htmlFor="amount">Refund Amount</Label>
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
                        />
                        <p className="text-sm text-muted-foreground">
                            Maximum refundable amount: ${maxAmount.toFixed(2)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Refund</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter the reason for this refund"
                            required
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
    );
}