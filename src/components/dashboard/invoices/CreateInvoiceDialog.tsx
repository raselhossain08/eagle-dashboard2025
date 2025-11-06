'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InvoiceItem } from './InvoiceItem';
import { Plus, Trash2 } from 'lucide-react';

const invoiceSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    subscriptionId: z.string().optional(),
    dueDate: z.string().min(1, 'Due date is required'),
    notes: z.string().optional(),
    items: z.array(z.object({
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Unit price must be positive'),
        totalPrice: z.number().min(0, 'Total price must be positive'),
    })).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
    const [items, setItems] = useState<Array<{ description: string; quantity: number; unitPrice: number; totalPrice: number }>>([
        { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]);

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            userId: '',
            subscriptionId: '',
            dueDate: '',
            notes: '',
            items: [],
        },
    });

    const createInvoice = useCreateInvoice();

    const addItem = () => {
        setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };

            // Calculate total price
            if (field === 'quantity' || field === 'unitPrice') {
                const quantity = field === 'quantity' ? value : newItems[index].quantity;
                const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice;
                newItems[index].totalPrice = quantity * unitPrice;
            }

            return newItems;
        });
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.0825; // 8.25% tax
        const total = subtotal + tax;

        return { subtotal, tax, total };
    };

    const onSubmit = (data: InvoiceFormData) => {
        const invoiceData = {
            ...data,
            items: items,
        };

        createInvoice.mutate(invoiceData, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                setItems([{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
            },
        });
    };

    const { subtotal, tax, total } = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Create a new invoice for a customer. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter user ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subscriptionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subscription ID (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter subscription ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <FormLabel>Invoice Items</FormLabel>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <InvoiceItem
                                        key={index}
                                        item={item}
                                        index={index}
                                        onUpdate={updateItem}
                                        onRemove={removeItem}
                                        showRemove={items.length > 1}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="space-y-2 max-w-xs ml-auto">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (8.25%):</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes for the invoice..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createInvoice.isPending}>
                                {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}