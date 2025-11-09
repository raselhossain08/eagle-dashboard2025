// components/transactions/UpdateStatusDialog.tsx
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Transaction, transactionService } from '@/lib/services/transactio.service';
import { AlertCircle, Loader2, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateStatusDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusUpdate?: () => void;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    { value: 'succeeded', label: 'Succeeded', icon: CheckCircle, color: 'text-green-600' },
    { value: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-600' },
    { value: 'refunded', label: 'Refunded', icon: Ban, color: 'text-gray-600' },
    { value: 'partially_refunded', label: 'Partially Refunded', icon: Ban, color: 'text-gray-600' },
    { value: 'disputed', label: 'Disputed', icon: AlertCircle, color: 'text-orange-600' },
];

export function UpdateStatusDialog({ transaction, open, onOpenChange, onStatusUpdate }: UpdateStatusDialogProps) {
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!transaction) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!status) {
            setError('Please select a status');
            return;
        }

        if (status === transaction.status) {
            setError('Please select a different status');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmUpdate = async () => {
        setLoading(true);
        setShowConfirmation(false);

        try {
            await transactionService.updateTransactionStatus(transaction._id, status, {
                notes: notes.trim() || undefined,
            });

            toast.success('Transaction status updated successfully');
            handleOpenChange(false);
            onStatusUpdate?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !loading) {
            setStatus('');
            setNotes('');
            setError(null);
            setShowConfirmation(false);
        }
        onOpenChange(newOpen);
    };

    const selectedStatus = statusOptions.find(opt => opt.value === status);
    const currentStatus = statusOptions.find(opt => opt.value === transaction.status);

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Transaction Status</DialogTitle>
                        <DialogDescription>
                            Update the status for transaction {transaction.transactionId}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Status</Label>
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                                {currentStatus && (
                                    <>
                                        <currentStatus.icon className={`h-4 w-4 ${currentStatus.color}`} />
                                        <span className="font-medium capitalize">{currentStatus.label}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">New Status *</Label>
                            <Select value={status} onValueChange={setStatus} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.value === transaction.status}
                                        >
                                            <div className="flex items-center gap-2">
                                                <option.icon className={`h-4 w-4 ${option.color}`} />
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this status change..."
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
                                Update Status
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to update the status from{' '}
                            <strong className="capitalize">{transaction.status}</strong> to{' '}
                            <strong className="capitalize">{status.replace('_', ' ')}</strong>?
                            {notes && (
                                <>
                                    <br />
                                    <br />
                                    <strong>Notes:</strong> {notes}
                                </>
                            )}
                            <br />
                            <br />
                            This action will be logged and may affect payment processing.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmUpdate}>
                            Confirm Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
