// components/transactions/TransactionDetailsDialog.tsx
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/lib/services/transactio.service';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionDetailsDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
    if (!transaction) return null;

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                    <DialogDescription>
                        Complete information for transaction {transaction.transactionId}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[80vh]">
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Transaction ID:</span>
                                    <p className="text-muted-foreground font-mono">{transaction.transactionId}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Type:</span>
                                    <Badge variant="outline" className="ml-2 capitalize">
                                        {transaction.type}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span>
                                    <Badge className="ml-2 capitalize">
                                        {transaction.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-medium">Provider:</span>
                                    <Badge variant="secondary" className="ml-2 capitalize">
                                        {transaction.psp.provider}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Amount Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Amount Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Gross Amount:</span>
                                    <p className="text-muted-foreground">
                                        {formatAmount(transaction.amount.gross, transaction.currency)}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium">Fees:</span>
                                    <p className="text-muted-foreground">
                                        {formatAmount(transaction.amount.fee, transaction.currency)}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium">Net Amount:</span>
                                    <p className="text-muted-foreground">
                                        {formatAmount(transaction.amount.net, transaction.currency)}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium">Currency:</span>
                                    <p className="text-muted-foreground">{transaction.currency}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium">Initiated:</span>
                                    <p className="text-muted-foreground">
                                        {formatDate(transaction.timeline.initiatedAt)}
                                    </p>
                                </div>
                                {transaction.timeline.capturedAt && (
                                    <div>
                                        <span className="font-medium">Captured:</span>
                                        <p className="text-muted-foreground">
                                            {formatDate(transaction.timeline.capturedAt)}
                                        </p>
                                    </div>
                                )}
                                {transaction.timeline.failedAt && (
                                    <div>
                                        <span className="font-medium">Failed:</span>
                                        <p className="text-muted-foreground">
                                            {formatDate(transaction.timeline.failedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        {transaction.billing && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Billing Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {transaction.billing.name && (
                                        <div>
                                            <span className="font-medium">Name:</span>
                                            <p className="text-muted-foreground">{transaction.billing.name}</p>
                                        </div>
                                    )}
                                    {transaction.billing.email && (
                                        <div>
                                            <span className="font-medium">Email:</span>
                                            <p className="text-muted-foreground">{transaction.billing.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {transaction.description && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Description</h3>
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}