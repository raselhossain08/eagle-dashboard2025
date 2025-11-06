'use client';

import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ViewInvoiceDialogProps {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
    if (!invoice) return null;

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'default';
            case 'pending': return 'secondary';
            case 'overdue': return 'destructive';
            case 'refunded': return 'outline';
            case 'partially_refunded': return 'secondary';
            default: return 'outline';
        }
    };

    const user = typeof invoice.userId === 'object' ? invoice.userId : null;
    const subscription = typeof invoice.subscriptionId === 'object' ? invoice.subscriptionId : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Invoice Details</DialogTitle>
                    <DialogDescription>
                        Detailed view of invoice {invoice.invoiceNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
                            <Badge variant={getStatusVariant(invoice.status)} className="mt-2">
                                {invoice.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">${invoice.total.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Customer and Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <h3 className="font-semibold">Customer</h3>
                            </div>
                            {user ? (
                                <div>
                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Loading user info...</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <h3 className="font-semibold">Dates</h3>
                            </div>
                            <div>
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Created: </span>
                                    {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Due: </span>
                                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                </p>
                                {invoice.paidAt && (
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Paid: </span>
                                        {format(new Date(invoice.paidAt), 'MMM dd, yyyy')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <h3 className="font-semibold">Subscription</h3>
                            </div>
                            {subscription ? (
                                <div>
                                    <p className="font-medium">{subscription.planName}</p>
                                    <Badge variant="outline">{subscription.status}</Badge>
                                </div>
                            ) : invoice.subscriptionId ? (
                                <p className="text-sm">
                                    {typeof invoice.subscriptionId === 'string'
                                        ? invoice.subscriptionId
                                        : 'Subscription details'}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No subscription</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Items */}
                    <div>
                        <h3 className="font-semibold mb-4">Items</h3>
                        <div className="space-y-3">
                            {invoice.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2 max-w-xs ml-auto">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax ({invoice.taxRate || 8.25}%):</span>
                            <span>${invoice.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${invoice.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {invoice.paymentMethod && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-2">Payment Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Method: </span>
                                        {invoice.paymentMethod}
                                    </div>
                                    {invoice.transactionId && (
                                        <div>
                                            <span className="text-muted-foreground">Transaction ID: </span>
                                            {invoice.transactionId}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-2">Notes</h3>
                                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}