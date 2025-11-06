import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PayPalTransaction } from '@/types/paypal';
import {
    Calendar,
    CreditCard,
    User,
    Mail,
    Phone,
    Shield
} from 'lucide-react';

interface TransactionDialogProps {
    transaction: PayPalTransaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({ transaction, open, onOpenChange }: TransactionDialogProps) {
    if (!transaction) return null;

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            case 'refunded':
                return 'outline';
            default:
                return 'default';
        }
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

                <div className="grid gap-6">
                    {/* Transaction Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Transaction ID:</span>
                            </div>
                            <code className="text-sm bg-muted p-1 rounded">
                                {transaction.transactionId}
                            </code>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Status:</span>
                            </div>
                            <Badge variant={getStatusVariant(transaction.status)}>
                                {transaction.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Amount Information */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Payment Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Amount</div>
                                <div className="text-lg font-bold">
                                    ${transaction.amount} {transaction.currency}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Payment Method</div>
                                <div className="font-medium capitalize">{transaction.paymentMethod}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Customer Information</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {transaction.userId.firstName} {transaction.userId.lastName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{transaction.userId.email}</span>
                            </div>
                            {transaction.userId.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{transaction.userId.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PayPal Details */}
                    {transaction.paypalDetails && (
                        <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                PayPal Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">PayPal Status</div>
                                    <div>{transaction.paypalDetails.status}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Seller Protection</div>
                                    <div>{transaction.paypalDetails.seller_protection.status}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Created</div>
                            <div>{new Date(transaction.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Last Updated</div>
                            <div>{new Date(transaction.updatedAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}