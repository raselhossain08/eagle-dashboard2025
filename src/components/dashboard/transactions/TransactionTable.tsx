// components/transactions/TransactionTable.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ArrowUpDown } from 'lucide-react';
import { Transaction } from '@/lib/services/transactio.service';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import { RefundDialog } from './RefundDialog';
import { UpdateStatusDialog } from './UpdateStatusDialog';

interface TransactionTableProps {
    transactions: Transaction[];
    loading: boolean;
    pagination?: any;
    showPagination?: boolean;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
}

export function TransactionTable({
    transactions,
    loading,
    pagination,
    showPagination = true,
    onPageChange,
    onRefresh
}: TransactionTableProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [refundOpen, setRefundOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

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
        // Backend sends amount in dollars
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTransaction(transaction);
                                                    setStatusOpen(true);
                                                }}
                                            >
                                                Update Status
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
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.current * pagination.limit, pagination.count)} of{' '}
                        {pagination.count} results
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange?.(1)}
                                    disabled={pagination.current === 1}
                                >
                                    First
                                </Button>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => onPageChange?.(pagination.current - 1)}
                                    className={pagination.current === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {(() => {
                                const currentPage = pagination.current;
                                const totalPages = pagination.total;
                                const delta = 2;
                                const range = [];
                                const rangeWithDots = [];

                                for (
                                    let i = Math.max(2, currentPage - delta);
                                    i <= Math.min(totalPages - 1, currentPage + delta);
                                    i++
                                ) {
                                    range.push(i);
                                }

                                if (currentPage - delta > 2) {
                                    rangeWithDots.push(1, '...');
                                } else {
                                    rangeWithDots.push(1);
                                }

                                rangeWithDots.push(...range);

                                if (currentPage + delta < totalPages - 1) {
                                    rangeWithDots.push('...', totalPages);
                                } else if (totalPages > 1) {
                                    rangeWithDots.push(totalPages);
                                }

                                return rangeWithDots.map((page, index) =>
                                    typeof page === 'number' ? (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={page === currentPage}
                                                onClick={() => onPageChange?.(page)}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={`dots-${index}`}>
                                            <span className="px-4">...</span>
                                        </PaginationItem>
                                    )
                                );
                            })()}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => onPageChange?.(pagination.current + 1)}
                                    className={pagination.current === pagination.total ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange?.(pagination.total)}
                                    disabled={pagination.current === pagination.total}
                                >
                                    Last
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <TransactionDetailsDialog
                transaction={selectedTransaction}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />

            <UpdateStatusDialog
                transaction={selectedTransaction}
                open={statusOpen}
                onOpenChange={setStatusOpen}
                onStatusUpdate={() => {
                    onRefresh?.();
                }}
            />

            <RefundDialog
                transaction={selectedTransaction}
                open={refundOpen}
                onOpenChange={setRefundOpen}
                onRefundSuccess={() => {
                    onRefresh?.();
                }}
            />
        </>
    );
}