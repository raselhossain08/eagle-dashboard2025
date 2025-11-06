// components/transactions/TransactionTable.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ArrowUpDown } from 'lucide-react';
import { Transaction } from '@/lib/transaction/transactionService';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import { RefundDialog } from './RefundDialog';

interface TransactionTableProps {
    transactions: Transaction[];
    loading: boolean;
    pagination?: any;
    showPagination?: boolean;
    onPageChange?: (page: number) => void;
}

export function TransactionTable({
    transactions,
    loading,
    pagination,
    showPagination = true,
    onPageChange
}: TransactionTableProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [refundOpen, setRefundOpen] = useState(false);

    const getStatusVariant = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            succeeded: 'default',
            pending: 'secondary',
            failed: 'destructive',
            refunded: 'outline',
            partially_refunded: 'outline',
            disputed: 'destructive',
        };
        return variants[status] || 'default';
    };

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No transactions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction._id}>
                                    <TableCell className="font-mono text-sm">
                                        {transaction.transactionId.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(transaction.timeline.initiatedAt)}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.billing?.email || 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatAmount(transaction.amount.gross, transaction.currency)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {transaction.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(transaction.status)} className="capitalize">
                                            {transaction.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {transaction.psp.provider}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTransaction(transaction);
                                                    setDetailsOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {transaction.status === 'succeeded' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction);
                                                        setRefundOpen(true);
                                                    }}
                                                >
                                                    Refund
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && pagination && pagination.total > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => onPageChange?.(pagination.current - 1)}
                                className={pagination.current === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>

                        {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === pagination.current}
                                    onClick={() => onPageChange?.(page)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => onPageChange?.(pagination.current + 1)}
                                className={pagination.current === pagination.total ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <TransactionDetailsDialog
                transaction={selectedTransaction}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />

            <RefundDialog
                transaction={selectedTransaction}
                open={refundOpen}
                onOpenChange={setRefundOpen}
            />
        </>
    );
}