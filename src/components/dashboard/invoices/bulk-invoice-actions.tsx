import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { billingService } from '@/lib/services/billing.service';
import { Invoice } from '@/lib/types/billing';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface BulkInvoiceActionsProps {
    invoices: Invoice[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onActionComplete: () => void;
}

export function BulkInvoiceActions({
    invoices,
    open,
    onOpenChange,
    onActionComplete,
}: BulkInvoiceActionsProps) {
    const [processing, setProcessing] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

    const handleBulkAction = async () => {
        if (!selectedAction || selectedInvoices.length === 0) return;

        try {
            setProcessing(true);

            if (selectedAction === 'send_email') {
                // Send emails to all selected invoices
                for (const invoiceId of selectedInvoices) {
                    const invoice = invoices.find(inv => inv._id === invoiceId);
                    const email = typeof invoice?.customerId === 'string'
                        ? invoice?.customerEmail
                        : invoice?.customerId?.email;
                    await billingService.sendInvoiceEmail(invoiceId, {
                        to: email || '',
                        subject: `Your Invoice ${invoice?.invoiceNumber}`
                    });
                }
            } else if (selectedAction === 'generate_pdf') {
                // Generate PDFs for all selected invoices
                for (const invoiceId of selectedInvoices) {
                    await billingService.generateInvoicePdf(invoiceId);
                }
            } else if (selectedAction === 'update_status') {
                // This would require additional UI for status selection
                // For now, just mark as paid
                for (const invoiceId of selectedInvoices) {
                    const invoice = invoices.find(inv => inv._id === invoiceId);
                    if (invoice && invoice.status === 'pending') {
                        await billingService.markInvoicePaid(invoiceId, {
                            paymentAmount: invoice.total,
                            paymentDate: new Date().toISOString().split('T')[0],
                            paymentMethod: 'BULK_UPDATE',
                            transactionId: `bulk_${Date.now()}_${invoiceId}`
                        });
                    }
                }
            }

            onActionComplete();
            onOpenChange(false);
            setSelectedInvoices([]);
            setSelectedAction('');
        } catch (error) {
            console.error('Failed to perform bulk action:', error);
        } finally {
            setProcessing(false);
        }
    };

    const toggleInvoiceSelection = (invoiceId: string) => {
        setSelectedInvoices(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const selectAllInvoices = () => {
        setSelectedInvoices(invoices.map(inv => inv._id));
    };

    const clearSelection = () => {
        setSelectedInvoices([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Invoice Actions</DialogTitle>
                    <DialogDescription>
                        Perform actions on multiple invoices at once
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Invoice Selection */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium">Select Invoices</h4>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={selectAllInvoices}>
                                    Select All
                                </Button>
                                <Button variant="outline" size="sm" onClick={clearSelection}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                            {invoices.map((invoice) => (
                                <div key={invoice._id} className="flex items-center space-x-2 p-2 border-b last:border-b-0">
                                    <Checkbox
                                        checked={selectedInvoices.includes(invoice._id)}
                                        onCheckedChange={() => toggleInvoiceSelection(invoice._id)}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{invoice.invoiceNumber}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {typeof invoice.customerId === 'string'
                                                ? invoice.customerEmail
                                                : invoice.customerId.email} - {invoice.total} {invoice.currency}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Selection */}
                    <div className="space-y-2">
                        <h4 className="font-medium">Select Action</h4>
                        <Select value={selectedAction} onValueChange={setSelectedAction}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose action..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="send_email">Send Email</SelectItem>
                                <SelectItem value="generate_pdf">Generate PDF</SelectItem>
                                <SelectItem value="update_status">Mark as Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkAction}
                            disabled={processing || selectedInvoices.length === 0 || !selectedAction}
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Execute ({selectedInvoices.length} invoices)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}