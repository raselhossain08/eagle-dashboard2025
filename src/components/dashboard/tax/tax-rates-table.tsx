// components/tax/tax-rates-table.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { TaxRate } from '@/lib/types/tax';
import { EditTaxRateDialog } from '@/components/dashboard/tax/edit-tax-rate-dialog';
import { DeleteTaxRateDialog } from '@/components/dashboard/tax/delete-tax-rate-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaxRatesTableProps {
    taxRates: TaxRate[];
    onEdit: (id: string, data: Partial<TaxRate>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    loading?: boolean;
}

export function TaxRatesTable({ taxRates, onEdit, onDelete, loading }: TaxRatesTableProps) {
    const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
    const [deletingRate, setDeletingRate] = useState<TaxRate | null>(null);

    const getTaxTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            SALES_TAX: 'bg-blue-100 text-blue-800',
            VAT: 'bg-green-100 text-green-800',
            GST: 'bg-purple-100 text-purple-800',
            WITHHOLDING: 'bg-orange-100 text-orange-800',
            EXCISE: 'bg-red-100 text-red-800',
            OTHER: 'bg-gray-100 text-gray-800',
        };
        return colors[type] || colors.OTHER;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
                ))}
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Country/State</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Effective Period</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {taxRates.map((rate) => (
                        <TableRow key={rate._id}>
                            <TableCell className="font-medium">{rate.name}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{rate.country}</span>
                                    <span className="text-sm text-gray-500">{rate.state}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={getTaxTypeColor(rate.taxType)}>
                                    {rate.taxType.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{rate.rate}%</TableCell>
                            <TableCell>
                                <Badge variant={rate.active ? 'default' : 'secondary'}>
                                    {rate.active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {rate.effectiveFrom && rate.effectiveTo ? (
                                    <div className="text-sm">
                                        <div>{formatDate(rate.effectiveFrom)}</div>
                                        <div>to {formatDate(rate.effectiveTo)}</div>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-sm">
                                {formatDate(rate.updatedAt)}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingRate(rate)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setDeletingRate(rate)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <EditTaxRateDialog
                rate={editingRate}
                open={!!editingRate}
                onOpenChange={(open: boolean) => !open && setEditingRate(null)}
                onSave={onEdit}
            />

            <DeleteTaxRateDialog
                rate={deletingRate}
                open={!!deletingRate}
                onOpenChange={(open: boolean) => !open && setDeletingRate(null)}
                onDelete={onDelete}
            />
        </>
    );
}