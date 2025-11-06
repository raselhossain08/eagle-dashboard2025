// components/payment-methods-table.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EditPaymentMethodDialog } from './edit-payment-method-dialog';
import { DeletePaymentMethodDialog } from './delete-payment-method-dialog';
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { PaymentMethod } from '@/lib/services/payment.service';
import { MoreHorizontal, Edit, Trash2, CreditCard, Building } from 'lucide-react';

interface PaymentMethodsTableProps {
    limit?: number;
}

export function PaymentMethodsTable({ limit }: PaymentMethodsTableProps) {
    const { methods, loading, error, fetchMethods, updateMethod, deleteMethod } = usePaymentMethods();
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

    useEffect(() => {
        fetchMethods(1, limit || 10);
    }, [fetchMethods, limit]);

    const handleStatusUpdate = async (method: PaymentMethod, status: 'active' | 'inactive') => {
        try {
            await updateMethod(method._id, { status });
        } catch (error) {
            console.error('Failed to update method status:', error);
        }
    };

    const handleSetDefault = async (method: PaymentMethod) => {
        try {
            await updateMethod(method._id, { isDefault: true });
        } catch (error) {
            console.error('Failed to set default method:', error);
        }
    };

    const handleUpdate = async (id: string, data: any) => {
        await updateMethod(id, data);
    };

    const displayMethods = limit ? methods.slice(0, limit) : methods;

    if (loading) return <div>Loading payment methods...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                        Manage customer payment methods and their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayMethods.map((method) => (
                                <TableRow key={method._id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {method.type === 'card' ? (
                                                <CreditCard className="h-4 w-4" />
                                            ) : (
                                                <Building className="h-4 w-4" />
                                            )}
                                            <span className="capitalize">{method.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {method.brand.toUpperCase()} •••• {method.last4}
                                            </div>
                                            {method.expiryMonth && method.expiryYear && (
                                                <div className="text-sm text-muted-foreground">
                                                    Expires {method.expiryMonth}/{method.expiryYear}
                                                </div>
                                            )}
                                            {method.isDefault && (
                                                <Badge variant="secondary" className="mt-1">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={method.status === 'active' ? 'default' : 'secondary'}
                                        >
                                            {method.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(method.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingMethod(method)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {method.status === 'active' ? (
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(method, 'inactive')}>
                                                        Deactivate
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(method, 'active')}>
                                                        Activate
                                                    </DropdownMenuItem>
                                                )}
                                                {!method.isDefault && (
                                                    <DropdownMenuItem onClick={() => handleSetDefault(method)}>
                                                        Set as Default
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingMethod(method)}
                                                    className="text-destructive"
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
                </CardContent>
            </Card>

            <EditPaymentMethodDialog
                method={editingMethod}
                onClose={() => setEditingMethod(null)}
                onUpdate={handleUpdate}
            />

            <DeletePaymentMethodDialog
                method={deletingMethod}
                onClose={() => setDeletingMethod(null)}
                onDelete={deleteMethod}
            />
        </>
    );
}