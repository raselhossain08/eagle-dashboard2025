import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { billingService } from '@/lib/services/billing.service';
import { TaxRate } from '@/lib/types/billing';
import { Loader2 } from 'lucide-react';

interface EditTaxRateDialogProps {
    taxRate: TaxRate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaxRateUpdated: () => void;
}

export function EditTaxRateDialog({
    taxRate,
    open,
    onOpenChange,
    onTaxRateUpdated,
}: EditTaxRateDialogProps) {
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        rate: '',
        active: true,
    });

    useEffect(() => {
        if (taxRate) {
            setFormData({
                rate: taxRate.rate.toString(),
                active: taxRate.active,
            });
        }
    }, [taxRate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taxRate) return;

        try {
            setUpdating(true);
            await billingService.updateTaxRate(taxRate._id, {
                rate: parseFloat(formData.rate),
                active: formData.active,
            });
            onTaxRateUpdated();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update tax rate:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (!taxRate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Tax Rate</DialogTitle>
                    <DialogDescription>
                        Update tax rate for {taxRate.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rate">Tax Rate (%)</Label>
                        <Input
                            id="rate"
                            type="number"
                            step="0.01"
                            value={formData.rate}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                rate: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                active: checked
                            }))}
                        />
                        <Label htmlFor="active">Active</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updating}>
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Tax Rate
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}