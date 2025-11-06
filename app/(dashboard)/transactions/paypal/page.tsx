'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { paypalService } from '@/lib/services/paypal.service';
import { PayPalTransaction } from '@/lib/types/paypal';
import { TransactionDialog } from '@/components/dashboard/transactions/transaction-dialog';
import { Search, Filter, Download, Eye } from 'lucide-react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<PayPalTransaction | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Filters
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTransactions();
    }, [page, status]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await paypalService.getTransactions({
                page,
                limit: 10,
                status: status || undefined,
                searchTerm: searchTerm || undefined,
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (transaction: PayPalTransaction) => {
        setSelectedTransaction(transaction);
        setIsDialogOpen(true);
    };

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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                <Button>
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
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && loadTransactions()}
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadTransactions}>
                            <Filter className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        Manage and review all PayPal transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction._id}>
                                    <TableCell className="font-mono text-sm">
                                        {transaction.transactionId}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {transaction.userId.firstName} {transaction.userId.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {transaction.userId.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        ${transaction.amount} {transaction.currency}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(transaction.status)}>
                                            {transaction.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(transaction)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <TransactionDialog
                transaction={selectedTransaction}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
}