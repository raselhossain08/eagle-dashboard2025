// components/tax/edit-tax-rate-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { TaxRate } from '@/types/tax';

interface EditTaxRateDialogProps {
    rate: TaxRate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, data: Partial<TaxRate>) => Promise<void>;
}

export function EditTaxRateDialog({ rate, open, onOpenChange, onSave }: EditTaxRateDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TaxRate>>({});

    useEffect(() => {
        if (rate) {
            setFormData({
                name: rate.name,
                description: rate.description,
                rate: rate.rate,
                active: rate.active,
            });
        }
    }, [rate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rate) return;

        setLoading(true);
        try {
            await onSave(rate._id, formData);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update tax rate:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!rate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Tax Rate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-rate">Rate (%)</Label>
                        <Input
                            id="edit-rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.rate || 0}
                            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.active || false}
                            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                        />
                        <Label>Active</Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}