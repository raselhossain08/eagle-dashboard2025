'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: any;
}

export function TransactionDialog({ open, onOpenChange, transaction }: TransactionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>
                {transaction && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Transaction ID</p>
                                <p className="font-medium">{transaction.transactionId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium capitalize">{transaction.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium">
                                    {transaction.currency} {transaction.amount}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">
                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
