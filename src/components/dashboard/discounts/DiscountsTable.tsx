// components/discounts/DiscountsTable.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2, Copy, Calendar } from 'lucide-react';
import { Discount } from '@/lib/services/discount.service';
import { DiscountDetailsDialog } from './DiscountDetailsDialog';
import { EditDiscountDialog } from './EditDiscountDialog';
import { DeleteDiscountDialog } from './DeleteDiscountDialog';

interface DiscountsTableProps {
    discounts: Discount[];
    loading: boolean;
    pagination?: any;
    showPagination?: boolean;
    onPageChange?: (page: number) => void;
    onDiscountsChange?: () => void;
}

export function DiscountsTable({
    discounts,
    loading,
    pagination,
    showPagination = true,
    onPageChange,
    onDiscountsChange
}: DiscountsTableProps) {
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const getStatusVariant = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            active: 'default',
            expired: 'destructive',
            disabled: 'outline',
        };
        return variants[status] || 'secondary';
    };

    const getTypeVariant = (type: string) => {
        return type === 'percentage' ? 'default' : 'secondary';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatValue = (discount: Discount) => {
        return discount.type === 'percentage'
            ? `${discount.value}%`
            : `$${discount.value}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getUsagePercentage = (discount: Discount) => {
        if (!discount.usageLimit || discount.usageLimit.total === 0) return 0;
        const used = discount.usageLimit.used || 0;
        return (used / discount.usageLimit.total) * 100;
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
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {discounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No discounts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            discounts.map((discount) => (
                                <TableRow key={discount._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="relative rounded bg-muted px-2 py-1 font-mono text-sm font-medium">
                                                {discount.code}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(discount.code)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{discount.name}</span>
                                            {discount.description && (
                                                <span className="text-sm text-muted-foreground">
                                                    {discount.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getTypeVariant(discount.type)} className="capitalize">
                                            {discount.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatValue(discount)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs">
                                                <span>{discount.usageLimit?.used || 0} / {discount.usageLimit?.total || '∞'}</span>
                                                <span>{getUsagePercentage(discount).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-1.5">
                                                <div
                                                    className="bg-primary h-1.5 rounded-full transition-all"
                                                    style={{ width: `${Math.min(getUsagePercentage(discount), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(discount.status)}>
                                            {discount.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(discount.endDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedDiscount(discount);
                                                    setDetailsOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedDiscount(discount);
                                                    setEditOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedDiscount(discount);
                                                    setDeleteOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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

            <DiscountDetailsDialog
                discount={selectedDiscount}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />

            <EditDiscountDialog
                discount={selectedDiscount}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSave={(data: any) => {
                    console.log('Save discount:', data);
                    onDiscountsChange?.();
                }}
            />

            <DeleteDiscountDialog
                discount={selectedDiscount}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={() => {
                    onDiscountsChange?.();
                }}
            />
        </>
    );
}