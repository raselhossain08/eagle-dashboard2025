'use client';

import { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewInvoiceDialog } from './ViewInvoiceDialog';
import { RefundDialog } from './RefundDialog';
import { SendEmailDialog } from './SendEmailDialog';
import { Eye, MoreHorizontal, FileText, Mail, Undo } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceTableProps {
    invoices: Invoice[];
    pagination?: any;
    isLoading: boolean;
    onPageChange: (page: number) => void;
}

export function InvoiceTable({ invoices, pagination, isLoading, onPageChange }: InvoiceTableProps) {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

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

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setViewDialogOpen(true);
    };

    const handleRefund = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setRefundDialogOpen(true);
    };

    const handleSendEmail = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setEmailDialogOpen(true);
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading invoices...</div>;
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice._id}>
                                <TableCell className="font-medium">
                                    {invoice.invoiceNumber}
                                </TableCell>
                                <TableCell>
                                    {typeof invoice.userId === 'object'
                                        ? `${invoice.userId.firstName} ${invoice.userId.lastName}`
                                        : 'Loading...'
                                    }
                                </TableCell>
                                <TableCell>
                                    {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>${invoice.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(invoice.status)}>
                                        {invoice.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSendEmail(invoice)}>
                                                <Mail className="w-4 h-4 mr-2" />
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="w-4 h-4 mr-2" />
                                                Download PDF
                                            </DropdownMenuItem>
                                            {(invoice.status === 'paid' || invoice.status === 'partially_refunded') && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleRefund(invoice)}
                                                        className="text-red-600"
                                                    >
                                                        <Undo className="w-4 h-4 mr-2" />
                                                        Process Refund
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} entries
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <ViewInvoiceDialog
                invoice={selectedInvoice}
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
            />

            <RefundDialog
                invoice={selectedInvoice}
                open={refundDialogOpen}
                onOpenChange={setRefundDialogOpen}
            />

            <SendEmailDialog
                invoice={selectedInvoice}
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
            />
        </>
    );
}