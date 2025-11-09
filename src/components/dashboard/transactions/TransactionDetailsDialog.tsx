// components/transactions/TransactionDetailsDialog.tsx
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/lib/services/transactio.service';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, AlertCircle, CreditCard, Wallet, DollarSign } from 'lucide-react';

interface TransactionDetailsDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
    if (!transaction) return null;

    const formatAmount = (amount: number, currency: string) => {
        // Backend sends amount in dollars
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
                    <div className="space-y-6 pr-4">
                        {/* Visual Timeline */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Transaction Status</h3>
                            <div className="relative flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        {transaction.status === 'succeeded' && (
                                            <CheckCircle className="h-8 w-8 text-green-500" />
                                        )}
                                        {transaction.status === 'failed' && (
                                            <XCircle className="h-8 w-8 text-red-500" />
                                        )}
                                        {transaction.status === 'pending' && (
                                            <Clock className="h-8 w-8 text-yellow-500" />
                                        )}
                                        {(transaction.status === 'refunded' || transaction.status === 'partially_refunded') && (
                                            <DollarSign className="h-8 w-8 text-blue-500" />
                                        )}
                                        {transaction.status === 'disputed' && (
                                            <AlertCircle className="h-8 w-8 text-orange-500" />
                                        )}
                                        <div>
                                            <p className="font-semibold text-lg capitalize">
                                                {transaction.status.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(transaction.timeline.initiatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

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
                            <h3 className="text-lg font-semibold mb-3">Event Timeline</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-blue-100 p-1">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">Transaction Initiated</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(transaction.timeline.initiatedAt)}
                                        </p>
                                    </div>
                                </div>

                                {transaction.timeline.capturedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-full bg-green-100 p-1">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Payment Captured</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(transaction.timeline.capturedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {transaction.timeline.failedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-full bg-red-100 p-1">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Transaction Failed</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(transaction.timeline.failedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {(transaction.timeline as any).refundedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 rounded-full bg-purple-100 p-1">
                                            <DollarSign className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Refund Processed</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate((transaction.timeline as any).refundedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Method */}
                        {(transaction as any).paymentMethod && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                                    {(transaction as any).paymentMethod.type === 'card' ? (
                                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    ) : (
                                        <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium capitalize">{(transaction as any).paymentMethod.type}</p>
                                        {(transaction as any).paymentMethod.details && (
                                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                {(transaction as any).paymentMethod.details.brand && (
                                                    <p>Brand: <span className="capitalize">{(transaction as any).paymentMethod.details.brand}</span></p>
                                                )}
                                                {(transaction as any).paymentMethod.details.last4 && (
                                                    <p>Last 4 digits: ****{(transaction as any).paymentMethod.details.last4}</p>
                                                )}
                                                {(transaction as any).paymentMethod.details.expiry && (
                                                    <p>Expires: {(transaction as any).paymentMethod.details.expiry}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(transaction as any).paymentMethod && <Separator />}

                        {/* Refund History */}
                        {(transaction as any).refunds && (transaction as any).refunds.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Refund History</h3>
                                <div className="space-y-3">
                                    {(transaction as any).refunds.map((refund: any, index: number) => (
                                        <div key={index} className="p-3 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {formatAmount(refund.amount, transaction.currency)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(refund.createdAt)}
                                                    </p>
                                                </div>
                                                <Badge variant={refund.status === 'succeeded' ? 'default' : 'secondary'}>
                                                    {refund.status}
                                                </Badge>
                                            </div>
                                            {refund.reason && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Reason: {refund.reason}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(transaction as any).refunds && (transaction as any).refunds.length > 0 && <Separator />}
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