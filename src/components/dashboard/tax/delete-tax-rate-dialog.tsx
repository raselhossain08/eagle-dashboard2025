// components/tax/delete-tax-rate-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { TaxRate } from '@/types/tax';

interface DeleteTaxRateDialogProps {
    rate: TaxRate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (id: string) => Promise<void>;
}

export function DeleteTaxRateDialog({ rate, open, onOpenChange, onDelete }: DeleteTaxRateDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!rate) return;

        setLoading(true);
        try {
            await onDelete(rate._id);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to delete tax rate:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!rate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Delete Tax Rate
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the tax rate &quot;{rate.name}&quot;?
                        This action cannot be undone and will permanently remove this tax rate from the system.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Tax Rate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}