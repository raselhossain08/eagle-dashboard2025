'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { paypalService } from '@/lib/services/paypal.service';
import { Refund } from '@/lib/types/paypal';
import { ProcessRefundDialog } from '@/components/dashboard/transactions/refunds/process-refund-dialog';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function RefundsPage() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

    useEffect(() => {
        loadRefunds();
    }, []);

    const loadRefunds = async () => {
        try {
            setLoading(true);
            const response = await paypalService.getRefunds({
                page: 1,
                limit: 10,
            });
            setRefunds(response.data);
        } catch (error) {
            console.error('Failed to load refunds:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Refunds</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadRefunds}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button onClick={() => setIsRefundDialogOpen(true)}>
                        Process Refund
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Refund History</CardTitle>
                    <CardDescription>
                        View and manage all refund requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Refund ID</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Refund Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {refunds.map((refund) => (
                                <TableRow key={refund._id}>
                                    <TableCell className="font-mono text-sm">
                                        {refund.refundId}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {refund.transactionId}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {refund.userId.firstName} {refund.userId.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {refund.userId.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        ${refund.refundAmount}
                                    </TableCell>
                                    <TableCell>
                                        {refund.refundReason}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(refund.status)}>
                                            {refund.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(refund.refundDate).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ProcessRefundDialog
                open={isRefundDialogOpen}
                onOpenChange={setIsRefundDialogOpen}
                onRefundProcessed={loadRefunds}
            />
        </div>
    );
}