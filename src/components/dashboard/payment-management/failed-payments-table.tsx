// components/failed-payments-table.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { paymentService, FailedPayment } from '@/lib/services/payment.service';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FailedPaymentsTableProps {
    limit?: number;
}

export function FailedPaymentsTable({ limit }: FailedPaymentsTableProps) {
    const [payments, setPayments] = useState<FailedPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState<string | null>(null);

    useEffect(() => {
        fetchFailedPayments();
    }, [limit]);

    const fetchFailedPayments = async () => {
        try {
            const response = await paymentService.getFailedPayments(1, limit || 10);
            setPayments(response.data);
        } catch (error) {
            console.error('Failed to fetch failed payments:', error);
            toast.error('Failed to load failed payments');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (paymentId: string) => {
        setRetrying(paymentId);
        try {
            await paymentService.retryFailedPayment(paymentId);
            toast.success('Payment retry initiated');
            fetchFailedPayments();
        } catch (error) {
            toast.error('Failed to retry payment');
        } finally {
            setRetrying(null);
        }
    };

    if (loading) return <div>Loading failed payments...</div>;

    const displayPayments = limit ? payments.slice(0, limit) : payments;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Failed Payments</CardTitle>
                <CardDescription>
                    Recent payment failures that require attention
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No failed payments
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayPayments.map((payment) => (
                                <TableRow key={payment._id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {payment.userId?.firstName} {payment.userId?.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {payment.userId?.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {payment.currency} {payment.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">{payment.status}</Badge>
                                        {payment.errorMessage && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {payment.errorMessage}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRetry(payment._id)}
                                            disabled={retrying === payment._id}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${retrying === payment._id ? 'animate-spin' : ''}`} />
                                            {retrying === payment._id ? 'Retrying...' : 'Retry'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
