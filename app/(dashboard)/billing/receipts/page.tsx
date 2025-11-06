'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { billingService } from '@/lib/services/billing.service';
import { Receipt } from '@/lib/types/billing';
import { ResendReceiptDialog } from '@/components/dashboard/billing/receipts/resend-receipt-dialog';
import { Search, Filter, Mail, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);

    // Filters
    const [paymentMethod, setPaymentMethod] = useState('all');
    const [customerId, setCustomerId] = useState('');

    useEffect(() => {
        loadReceipts();
    }, [paymentMethod]);

    const loadReceipts = async () => {
        try {
            setLoading(true);
            const response = await billingService.getReceipts({
                page: 1,
                limit: 20,
                paymentMethod: paymentMethod === 'all' ? undefined : paymentMethod,
                customerId: customerId || undefined,
            });
            setReceipts(response.data || []);
        } catch (error) {
            console.error('Failed to load receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendReceipt = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        setIsResendDialogOpen(true);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Payment Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="PAYPAL">PayPal</SelectItem>
                                <SelectItem value="CARD">Credit Card</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Customer ID"
                            value={customerId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerId(e.target.value)}
                        />
                        <Button onClick={loadReceipts}>
                            <Filter className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Receipts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Receipts</CardTitle>
                    <CardDescription>
                        View and manage payment receipts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Receipt Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipts.map((receipt) => (
                                <TableRow key={receipt._id}>
                                    <TableCell className="font-medium">
                                        {receipt.receiptNumber}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {typeof receipt.customerId === 'string'
                                                    ? receipt.customerName
                                                    : `${receipt.customerId.firstName} ${receipt.customerId.lastName}`}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {typeof receipt.customerId === 'string'
                                                    ? receipt.customerEmail
                                                    : receipt.customerId.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(receipt.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {receipt.paymentMethod.toLowerCase().replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {receipt.transactionId}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(receipt.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleResendReceipt(receipt)}
                                        >
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ResendReceiptDialog
                receipt={selectedReceipt}
                open={isResendDialogOpen}
                onOpenChange={setIsResendDialogOpen}
                onReceiptResent={loadReceipts}
            />
        </div>
    );
}