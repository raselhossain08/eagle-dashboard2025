'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Discount } from '@/lib/services/discount.service';

interface DeleteDiscountDialogProps {
    discount: Discount | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function DeleteDiscountDialog({ discount, open, onOpenChange, onConfirm }: DeleteDiscountDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    if (!discount) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Discount
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this discount code?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="bg-muted p-4 rounded-lg space-y-1">
                        <div className="font-medium">{discount.name}</div>
                        <div className="text-sm text-muted-foreground">Code: {discount.code}</div>
                        <div className="text-sm text-muted-foreground">
                            Value: {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        This action cannot be undone. The discount code will be permanently removed.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Delete Discount
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
