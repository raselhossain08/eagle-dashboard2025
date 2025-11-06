import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { paypalService } from '@/services/paypal.service';
import { Loader2 } from 'lucide-react';

interface ProcessRefundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefundProcessed: () => void;
}

export function ProcessRefundDialog({
    open,
    onOpenChange,
    onRefundProcessed
}: ProcessRefundDialogProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        transactionId: '',
        amount: '',
        reason: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const handleConfirmRefund = async () => {
        try {
            setProcessing(true);
            await paypalService.processRefund({
                transactionId: formData.transactionId,
                amount: parseFloat(formData.amount),
                reason: formData.reason
            });

            onRefundProcessed();
            setIsConfirmOpen(false);
            onOpenChange(false);
            setFormData({ transactionId: '', amount: '', reason: '' });

            // Show success message
        } catch (error) {
            console.error('Failed to process refund:', error);
            // Show error message
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        setIsConfirmOpen(false);
        setFormData({ transactionId: '', amount: '', reason: '' });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Refund</DialogTitle>
                        <DialogDescription>
                            Issue a refund for a PayPal transaction
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction ID</Label>
                            <Input
                                id="transactionId"
                                placeholder="PAYID-MXYZ123456789"
                                value={formData.transactionId}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    transactionId: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Refund Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="99.99"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    amount: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Refund Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter the reason for this refund..."
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    reason: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Process Refund
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to process a refund of ${formData.amount} for
                            transaction {formData.transactionId}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmRefund}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}