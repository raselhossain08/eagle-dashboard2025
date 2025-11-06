'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProcessRefund } from '@/hooks/useInvoices';
import { Invoice } from '@/types/invoice';
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const refundSchema = z.object({
    refundType: z.enum(['full', 'partial']),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    reason: z.string().min(1, 'Reason is required'),
});

type RefundFormData = z.infer<typeof refundSchema>;

interface RefundDialogProps {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ invoice, open, onOpenChange }: RefundDialogProps) {
    const [refundType, setRefundType] = useState<'full' | 'partial'>('full');

    const form = useForm<RefundFormData>({
        resolver: zodResolver(refundSchema),
        defaultValues: {
            refundType: 'full',
            amount: invoice?.total || 0,
            reason: '',
        },
    });

    const processRefund = useProcessRefund();

    const onSubmit = (data: RefundFormData) => {
        if (!invoice) return;

        const refundData = {
            amount: data.amount,
            reason: data.reason,
        };

        processRefund.mutate(
            { invoiceId: invoice._id, data: refundData },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                },
            }
        );
    };

    const handleRefundTypeChange = (type: 'full' | 'partial') => {
        setRefundType(type);
        form.setValue('refundType', type);
        if (type === 'full' && invoice) {
            form.setValue('amount', invoice.total);
        }
    };

    if (!invoice) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Refund</DialogTitle>
                    <DialogDescription>
                        Refund payment for invoice {invoice.invoiceNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span>Invoice Total:</span>
                            <span className="font-semibold">${invoice.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Customer:</span>
                            <span>
                                {typeof invoice.userId === 'object'
                                    ? `${invoice.userId.firstName} ${invoice.userId.lastName}`
                                    : 'Loading...'
                                }
                            </span>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="refundType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Refund Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={(value: 'full' | 'partial') => {
                                                    field.onChange(value);
                                                    handleRefundTypeChange(value);
                                                }}
                                                className="flex space-x-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="full" id="full" />
                                                    <Label htmlFor="full">Full Refund (${invoice.total.toFixed(2)})</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="partial" id="partial" />
                                                    <Label htmlFor="partial">Partial Refund</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {refundType === 'partial' && (
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Refund Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    max={invoice.total}
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Maximum refundable amount: ${invoice.total.toFixed(2)}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Refund Reason</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter reason for refund..."
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
                                <Button
                                    type="submit"
                                    disabled={processRefund.isPending}
                                    variant="destructive"
                                >
                                    {processRefund.isPending ? 'Processing...' : 'Process Refund'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}