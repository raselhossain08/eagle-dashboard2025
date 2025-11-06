'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface InvoiceItemProps {
    item: {
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    };
    index: number;
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
    showRemove: boolean;
}

export function InvoiceItem({ item, index, onUpdate, onRemove, showRemove }: InvoiceItemProps) {
    return (
        <div className="flex gap-4 items-start p-4 border rounded-lg">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        className="min-h-20"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Unit Price</label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => onUpdate(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Total Price</label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.totalPrice}
                        readOnly
                        className="bg-muted"
                    />
                </div>
            </div>

            {showRemove && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="mt-8"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}